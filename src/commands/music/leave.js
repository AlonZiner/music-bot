const queueManager = require('../../services/queueManager');
const { messages } = require('../../utils/constants');

module.exports = {
    name: 'leave',
    aliases: ['l'],
    description: 'Leave the voice channel',
    usage: '!leave',
    category: 'music',
    execute(message) {
        const queue = queueManager.getQueue(message.guild.id);
        
        if (queue && queue.connection) {
            queue.connection.destroy();
            queueManager.clearQueue(message.guild.id);
            message.reply(messages.LEAVE_SUCCESS);
        }
    }
};