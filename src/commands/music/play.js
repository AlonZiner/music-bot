const { messages } = require('../../utils/constants');
const musicPlayer = require('../../services/musicPlayer');
const queueManager = require('../../services/queueManager');
const youtubeService = require('../../services/youtubeService');
const { MAX_MIX_SIZE } = require('../../config/botConfig');
const play = require('play-dl'); 

module.exports = {
    name: 'play',
    aliases: ['p'],
    description: 'Play a song by URL or search query',
    usage: '!play <YouTube URL/Mix URL/search query>',
    examples: [
        '!play https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        '!play never gonna give you up'
    ],

    category: 'music',
    async execute(message, args) {
        try {
            if (!args.length) {
                return message.reply('Please provide a YouTube URL or search query!');
            }

            const input = args.join(' '); // Join all args for search queries
            let songInfo;

            // Join channel if not already joined
            if (!queueManager.getQueue(message.guild.id)?.connection) {
                await musicPlayer.joinChannel(message);
            }

            // Check if input is a URL or search query
            if (play.validate(input)) {
                // Handle URL (Mix or single video)
                if (youtubeService.isMixPlaylist(input)) {
                    // ... existing Mix playlist handling ...
                } else {
                    songInfo = await youtubeService.getVideoInfo(input);
                }
            } else {
                // Handle as search query
                message.reply(`🔍 Searching for: ${input}`);
                songInfo = await youtubeService.searchSong(input);
                
                if (!songInfo) {
                    return message.reply('❌ No results found for your search query.');
                }
                
                message.reply(`✅ Found: ${songInfo.title}`);
            }

            if (songInfo) {
                const song = {
                    ...songInfo,
                    requester: message.author.globalName
                };

                const added = queueManager.addSong(message.guild.id, song);
                if (!added) {
                    return message.reply(messages.QUEUE_ERROR);
                }

                message.reply(`${messages.SONG_ADDED} ${song.title}`);

                // Start playing if not already playing
                const queue = queueManager.getQueue(message.guild.id);
                if (!queue.playing) {
                    queue.playing = true;
                    await musicPlayer.playSong(message.guild.id, song, message.channel);
                }
            }

        } catch (error) {
            console.error('Play command error:', error);
            message.reply(messages.PLAY_ERROR);
        }
    },

    // Background loading function
    async loadMixInBackground(message, url) {
        try {
            const mixInfo = await youtubeService.getMixPlaylist(url, MAX_MIX_SIZE);
            
            // Skip first song as it's already added
            const remainingSongs = mixInfo.songs.slice(1);
            
            let addedCount = 0;
            for (const song of remainingSongs) {
                const songToAdd = {
                    ...song,
                    requester: message.author.tag
                };
                const added = queueManager.addSong(message.guild.id, songToAdd);
                if (added) addedCount++;
            }

            // Notify when background loading is complete
            message.channel.send(`✅ Added ${addedCount} more songs from the mix`);

        } catch (error) {
            console.error('Error loading mix in background:', error);
            message.channel.send('⚠️ Some songs from the mix could not be loaded');
        }
    }
};