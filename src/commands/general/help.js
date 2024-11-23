const { EmbedBuilder } = require('discord.js');
const { prefix } = require('../../config/botConfig');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'help',
    aliases: ['h'],
    description: 'Show all commands or info about a specific command',
    usage: '!help [command]',
    category: 'general',
    execute(message, args) {
        // Function to load all commands
        const loadCommands = () => {
            const commands = new Map();
            const validCategories = ['music', 'general']; // Define valid categories
            
            validCategories.forEach(folder => {
                const commandsPath = path.join(__dirname, '..', folder);
                const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
                
                commandFiles.forEach(file => {
                    const command = require(path.join(commandsPath, file));
                    if (validCategories.includes(command.category)) { // Only add commands from valid categories
                        commands.set(command.name, command);
                    }
                });
            });
            
            return commands;
        };

        const commands = loadCommands();
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🎵 Music Bot Commands');

        if (!args.length) {
            // Group commands by category
            const categories = new Map();
            
            // Initialize categories
            categories.set('music', []);
            categories.set('general', []);
            
            commands.forEach(command => {
                if (categories.has(command.category)) {
                    categories.get(command.category).push(command);
                }
            });

            // Add fields for each category
            categories.forEach((cmds, category) => {
                const commandList = cmds.map(cmd => {
                    const aliases = cmd.aliases ? ` (${cmd.aliases.join(', ')})` : '';
                    return `\`${prefix}${cmd.name}${aliases}\`: ${cmd.description}`;
                }).join('\n');

                if (commandList) { // Only add category if it has commands
                    embed.addFields({ 
                        name: `${category.charAt(0).toUpperCase() + category.slice(1)} Commands`, 
                        value: commandList 
                    });
                }
            });

            embed.setFooter({ text: `Type ${prefix}help [command] for detailed info about a command` });

        } else {
            const commandName = args[0].toLowerCase();
            const command = commands.get(commandName) || 
                           Array.from(commands.values()).find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command) {
                return message.reply('That\'s not a valid command!');
            }

            embed.setTitle(`Command: ${command.name}`);

            if (command.aliases) {
                embed.addFields({ name: 'Aliases', value: command.aliases.join(', ') });
            }
            if (command.description) {
                embed.addFields({ name: 'Description', value: command.description });
            }
            if (command.usage) {
                embed.addFields({ name: 'Usage', value: command.usage });
            }
            if (command.examples) {
                embed.addFields({ name: 'Examples', value: command.examples.join('\n') });
            }
        }

        message.reply({ embeds: [embed] });
    }
};