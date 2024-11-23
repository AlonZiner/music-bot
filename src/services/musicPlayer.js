const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus,
    NoSubscriberBehavior
} = require('@discordjs/voice');
const play = require('play-dl'); 
const queueManager = require('./queueManager');
const ytpl = require('youtube-playlist');
const { MAX_PLAYLIST_SIZE } = require('../config/botConfig'); 
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class MusicPlayer {
    constructor() {
        this.audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });
        
        this.audioPlayer.on(AudioPlayerStatus.Playing, () => {
            console.log('Audio player state: Playing');
        });

        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            console.log('Audio player state: Idle');
            this.processQueue(); // Play next song
        });

        this.audioPlayer.on('error', error => {
            console.error('Player error:', error);
            this.processQueue(); // Try next song on error
        });
    }

    async processQueue() {
        const guilds = Array.from(queueManager.queues.keys());
        for (const guildId of guilds) {
            const queue = queueManager.getQueue(guildId);
            if (queue && queue.songs.length > 0) {
                const nextSong = queue.songs.shift();
                if (nextSong) {
                    try {
                        await this.playSong(guildId, nextSong);
                    } catch (error) {
                        console.error('Error in processQueue:', error);
                    }
                }
            }
        }
    }

    async joinChannel(message) {
        try {
            const voiceChannel = message.member.voice.channel;
            
            if (!voiceChannel) {
                throw new Error('You must be in a voice channel!');
            }
    
            console.log(`Attempting to join voice channel in server: ${message.guild.name}`);
            console.log(`Voice channel: ${voiceChannel.name}`);
            console.log(`Guild ID: ${message.guild.id}`);
            
            // Check permissions explicitly
            const permissions = voiceChannel.permissionsFor(message.client.user);
            if (!permissions.has('Connect') || !permissions.has('Speak')) {
                console.log(`Missing permissions in ${message.guild.name}:`);
                console.log(`Can Connect: ${permissions.has('Connect')}`);
                console.log(`Can Speak: ${permissions.has('Speak')}`);
                throw new Error('I need permissions to join and speak in your voice channel!');
            }
    
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
    
            const queue = queueManager.createQueue(voiceChannel.guild.id);
            queue.connection = connection;
            
            console.log(`Successfully joined voice channel in ${message.guild.name}`);
            
            return connection;
        } catch (error) {
            console.error(`Error joining channel in ${message.guild?.name}:`, error);
            throw error;
        }
    }

    async getPlaylistSongs(url, maxSongs = 20) {
        try {
            const playlist = await ytpl(url);
            const songs = [];
            
            // Get only first maxSongs videos
            for (let i = 0; i < Math.min(playlist.items.length, maxSongs); i++) {
                const video = playlist.items[i];
                const songInfo = await ytdl.getInfo(video.url);
                songs.push({
                    title: songInfo.videoDetails.title,
                    url: video.url,
                    duration: songInfo.videoDetails.lengthSeconds,
                    requester: message.author.tag
                });
            }
    
            return {
                name: playlist.title,
                songs: songs
            };
        } catch (error) {
            console.error('Error getting playlist:', error);
            throw error;
        }
    }

    async playSong(guildId, song, textChannel) {
        try {
            const queue = queueManager.getQueue(guildId);
            if (!queue) return false;

            const stream = ytdl(song.url, {
                filter: 'audioonly',
                quality: 'lowestaudio',
                highWaterMark: 1 << 25,
                requestOptions: {
                    maxRetries: 3,
                    maxReconnects: 3,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
                    }
                }
            });
            
            const resource = createAudioResource(stream, {
                inlineVolume: true
            });
            
            if (queue.connection) {
                queue.connection.subscribe(this.audioPlayer);
            } else {
                console.log('No connection found in queue');
                return false;
            }

            this.audioPlayer.play(resource);
            queue.playing = true;

            // Send message with buttons if textChannel is provided
            if (textChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('🎵 Now Playing')
                    .setDescription(`**${song.title}**\nRequested by: ${song.requester}`)
                    .setColor('#FF0000');

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('pauseresume')
                            .setEmoji('⏯️')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('skip')
                            .setEmoji('⏭️')
                            .setStyle(ButtonStyle.Secondary)
                    );

                const message = await textChannel.send({
                    embeds: [embed],
                    components: [row]
                });

                // Create button collector
                const collector = message.createMessageComponentCollector({
                    time: 3600000 // 1 hour
                });

                collector.on('collect', async interaction => {
                    const queue = queueManager.getQueue(interaction.guildId);
                    if (!queue) return;

                    switch (interaction.customId) {
                        case 'pauseresume':
                            if (queue.playing) {
                                this.audioPlayer.pause();
                                queue.playing = false;
                                await interaction.reply('⏸️ Paused!');
                            } else {
                                this.audioPlayer.unpause();
                                queue.playing = true;
                                await interaction.reply('▶️ Resumed!');
                            }
                            break;
                        case 'skip':
                            // Skip current song regardless of queue status
                            queue.songs.shift();
                            if (queue.songs.length > 0) {
                                this.playSong(interaction.guildId, queue.songs[0], textChannel);
                            } else {
                                queue.playing = false;
                                this.stop(interaction.guildId);
                            }
                            await interaction.reply('⏭️ Skipped!');
                            break;
                    }
                });
            }

            return true;
        } catch (error) {
            console.error('Error playing song:', error);
            throw error;
        }
    }

    stop(guildId) {
        const queue = queueManager.getQueue(guildId);
        if (!queue) return false;

        this.audioPlayer.stop();
        queue.playing = false;
        return true;
    }
    
    disconnect(guildId) {
        const queue = queueManager.getQueue(guildId);
        if (queue && queue.connection) {
            queue.connection.destroy();
            queue.connection = null;
            queue.playing = false;
            queue.songs = [];
        }
    }
}

module.exports = new MusicPlayer();