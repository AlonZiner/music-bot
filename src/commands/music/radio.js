const { messages } = require('../../utils/constants');
const musicPlayer = require('../../services/musicPlayer');
const queueManager = require('../../services/queueManager');
const youtubeService = require('../../services/youtubeService');
const { MAX_MIX_SIZE } = require('../../config/botConfig');

module.exports = {
    name: 'radio',
    aliases: ['r'],
    description: 'Generate a radio based on the current playing song',
    usage: '!radio',
    category: 'music',
    async execute(message) {
        try {
            const queue = queueManager.getQueue(message.guild.id);
            
            if (!queue || !queue.playing) {
                return message.reply('❌ Nothing is currently playing!');
            }

            const currentSong = queue.songs[0];
            if (!currentSong) {
                return message.reply('❌ No song found in queue!');
            }

            message.reply('📻 Generating radio station based on current song...');

            // Get related songs
            const relatedSongs = await youtubeService.getRelatedSongs(currentSong.url, MAX_MIX_SIZE);
            
            if (!relatedSongs.length) {
                return message.reply('❌ Could not find any related songs!');
            }

            // Clear current queue except for the playing song
            queue.songs = [currentSong];

            // Add related songs to queue
            let addedCount = 0;
            for (const song of relatedSongs) {
                const songToAdd = {
                    ...song,
                    requester: message.author.tag
                };
                const added = queueManager.addSong(message.guild.id, songToAdd);
                if (added) addedCount++;
            }

            message.reply(`✅ Added ${addedCount} similar songs to the queue based on: ${currentSong.title}`);

        } catch (error) {
            console.error('Radio command error:', error);
            message.reply('❌ Error generating radio station.');
        }
    }
};