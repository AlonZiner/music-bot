const { messages } = require('../../utils/constants');
const musicPlayer = require('../../services/musicPlayer');
const queueManager = require('../../services/queueManager');

module.exports = {
    name: 'clear',
    aliases: ['c'],
    description: 'Clear the music queue and stop playback',
    usage: '!clear',
    category: 'music',
    execute(message) {
        try {
            const queue = queueManager.getQueue(message.guild.id);
            
            if (!queue) {
                return message.reply(messages.QUEUE_EMPTY);
            }

            queue.songs = [];
            queue.playing = false;
            musicPlayer.stop(message.guild.id);
            
            message.reply('🧹 Queue cleared and playback stopped.');
        } catch (error) {
            console.error('Clear command error:', error);
            message.reply(messages.CLEAR_ERROR);
        }
    }
};