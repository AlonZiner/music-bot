module.exports = {
    name: 'ping',
    aliases: [],
    description: 'Check if bot is responsive',
    usage: '!ping',
    category: 'general',
    execute(message) {
        message.reply('Pong! 🏓');
    }
};