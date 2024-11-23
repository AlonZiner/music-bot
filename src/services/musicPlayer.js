const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus,
    NoSubscriberBehavior
} = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const queueManager = require('./queueManager');
const ytpl = require('youtube-playlist');
const { MAX_PLAYLIST_SIZE } = require('../config/botConfig'); 

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

            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            const queue = queueManager.createQueue(voiceChannel.guild.id);
            queue.connection = connection;
            
            return connection;
        } catch (error) {
            console.error('Error joining channel:', error);
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

    async playSong(guildId, song) {
        try {
            console.log('Starting playSong function...');
            const queue = queueManager.getQueue(guildId);
            if (!queue) {
                console.log('No queue found');
                return false;
            }
    
            console.log('Creating stream for:', song.url);
            const stream = ytdl(song.url, {
                filter: 'audioonly',
                quality: 'lowestaudio',
                highWaterMark: 1 << 25
            });
    
            console.log('Creating audio resource...');
            const resource = createAudioResource(stream, {
                inlineVolume: true
            });
            
            if (queue.connection) {
                console.log('Subscribing to audio player...');
                queue.connection.subscribe(this.audioPlayer);
            } else {
                console.log('No connection found in queue');
                return false;
            }
    
            console.log('Playing resource...');
            this.audioPlayer.play(resource);
            queue.playing = true;
    
            console.log('Playback initiated');
            return true;
        } catch (error) {
            console.error('Error in playSong:', error);
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