const { EmbedBuilder } = require('discord.js');
const queueManager = require('../../services/queueManager');
const { messages } = require('../../utils/constants');

module.exports = {
    name: 'queue',
    aliases: ['q'],
    description: 'Show the music queue',
    usage: '!queue',
    category: 'music',
    execute(message) {
        const queue = queueManager.getQueue(message.guild.id);
        
        if (!queue || !queue.songs.length) {
            return message.reply(messages.QUEUE_EMPTY);
        }

        const embed = new EmbedBuilder()
            .setTitle('Music Queue')
            .setColor('#FF0000');

        const queueList = queue.songs.map((song, index) => 
            `${index + 1}. ${song.title} | Requested by: ${song.requester}`
        );

        embed.setDescription(queueList.join('\n'));
        message.reply({ embeds: [embed] });
    }
};