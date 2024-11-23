const { messages } = require('../../utils/constants');
const musicPlayer = require('../../services/musicPlayer');
const queueManager = require('../../services/queueManager');

module.exports = {
    name: 'skip',
    aliases: ['s'],
    description: 'Skip one or multiple songs',
    usage: '!skip [number]',
    examples: [
        '!skip - Skips current song',
        '!skip 3 - Skips current song and next 2 songs'
    ],
    category: 'music',
    async execute(message, args) {
        try {
            const queue = queueManager.getQueue(message.guild.id);
            
            if (!queue || !queue.songs.length) {
                return message.reply(messages.QUEUE_EMPTY);
            }

            // Get number of songs to skip (default to 1)
            const skipCount = args.length ? parseInt(args[0]) : 1;

            if (isNaN(skipCount) || skipCount < 1) {
                return message.reply('Please provide a valid number of songs to skip');
            }

            // Remove songs from queue
            const songsToSkip = Math.min(skipCount, queue.songs.length);
            queue.songs.splice(0, songsToSkip);

            // If there are songs left, play the next one
            if (queue.songs.length > 0) {
                await musicPlayer.playSong(message.guild.id, queue.songs[0]);
                message.reply(`⏭️ Skipped ${songsToSkip} song${songsToSkip > 1 ? 's' : ''}. Now playing: ${queue.songs[0].title}`);
            } else {
                queue.playing = false;
                musicPlayer.stop(message.guild.id);
                message.reply(`⏹️ Skipped ${songsToSkip} song${songsToSkip > 1 ? 's' : ''}. Queue is now empty.`);
            }

        } catch (error) {
            console.error('Skip command error:', error);
            message.reply(messages.SKIP_ERROR);
        }
    }
};