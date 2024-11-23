const musicPlayer = require('../services/musicPlayer');
const queueManager = require('../services/queueManager');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        // Get the bot's voice channel
        const botVoiceChannel = oldState.guild.members.me.voice.channel;
        
        // If bot is not in a voice channel, ignore
        if (!botVoiceChannel) return;

        // Count members in bot's channel (excluding the bot)
        const membersInChannel = botVoiceChannel.members.filter(member => !member.user.bot).size;

        // If bot is alone in the channel
        if (membersInChannel === 0) {
            console.log('Bot is alone in voice channel, leaving...');
            
            // Get queue and connection
            const queue = queueManager.getQueue(oldState.guild.id);
            if (queue) {
                if (queue.connection) {
                    queue.connection.destroy(); // Correct way to disconnect
                }
                queue.songs = [];
                queue.playing = false;
                queue.connection = null;
            }

            // Stop playing
            musicPlayer.stop(oldState.guild.id);

            // Send message to the last active text channel
            const textChannel = oldState.guild.channels.cache
                .find(channel => 
                    channel.type === 0 && // 0 is text channel
                    channel.lastMessage
                );
            
            if (textChannel) {
                textChannel.send('👋 Left the voice channel as I was left alone.');
            }
        }
    },
};