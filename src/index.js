require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const commandHandler = require('./handlers/commandHandler');
const { prefix } = require('./config/botConfig');
const fs = require('fs');
const path = require('path');
const play = require('play-dl');

async function initializeBot() {
    try {
        // Initialize play-dl
        await play.setToken({
            youtube: {
                cookie: '',
                id: true,
                token: true
            },
            spotify: false
        });

        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.MessageContent
            ]
        });

        const eventsPath = path.join(__dirname, 'events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const event = require(path.join(eventsPath, file));
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        }

        client.once('ready', () => {
            console.log('Bot is online!');
            // Load all commands
            commandHandler.loadCommands();
        });

        client.on('messageCreate', message => {
            // Ignore messages from bots or messages that don't start with prefix
            if (message.author.bot || !message.content.startsWith(prefix)) return;

            // Split into command and arguments
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            // Get command or alias
            const command = commandHandler.getCommand(commandName);
            
            if (!command) return;

            // Execute command
            try {
                command.execute(message, args);
            } catch (error) {
                console.error(error);
                message.reply('There was an error executing that command!');
            }
        });

        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.error('Error initializing bot:', error);
    }
}

// Start the bot
initializeBot();