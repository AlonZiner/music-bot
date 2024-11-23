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
            .setTitle('🎵 Music Queue')
            .setColor('#FF0000');

        // Format queue list with requester info
        const queueList = queue.songs.map((song, index) => {
            const prefix = index === 0 ? '**Now Playing:**' : `**${index}.** `;
            return `${prefix} ${song.title} | Requested by: ${song.requester}`;
        });

        embed.setDescription(queueList.join('\n'));
        
        if (queue.songs.length > 1) {
            embed.setFooter({ text: `${queue.songs.length} songs in queue` });
        }

        message.reply({ embeds: [embed] });
    }
};