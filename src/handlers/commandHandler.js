const fs = require('fs');
const path = require('path');

class CommandHandler {
    constructor() {
        this.commands = new Map();
        this.aliases = new Map();
    }

    // Load all commands from the commands directory
    loadCommands() {
        const commandCategories = ['music', 'general'];
        
        for (const category of commandCategories) {
            const commandsPath = path.join(__dirname, '..', 'commands', category);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const command = require(path.join(commandsPath, file));
                
                // Set main command
                this.commands.set(command.name, command);

                // Set aliases
                if (command.aliases) {
                    command.aliases.forEach(alias => {
                        this.aliases.set(alias, command.name);
                    });
                }
            }
        }
        console.log(`Loaded ${this.commands.size} commands!`);
    }

    // Get command by name or alias
    getCommand(name) {
        // Check for main command first
        if (this.commands.has(name)) {
            return this.commands.get(name);
        }
        
        // Check for alias
        const commandName = this.aliases.get(name);
        if (commandName) {
            return this.commands.get(commandName);
        }

        return null;
    }
}

module.exports = new CommandHandler();