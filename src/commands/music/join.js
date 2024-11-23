const musicPlayer = require('../../services/musicPlayer');
const { messages } = require('../../utils/constants');

module.exports = {
    name: 'join',
    aliases: ['j'],
    description: 'Join a voice channel',
    usage: '!join',
    category: 'music',
    async execute(message) {
        try {
            await musicPlayer.joinChannel(message);
            message.reply(messages.JOIN_SUCCESS);
        } catch (error) {
            console.error('Join command error:', error);
            message.reply(error.message || messages.JOIN_ERROR);
        }
    }
};