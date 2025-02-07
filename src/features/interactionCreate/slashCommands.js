const CommandManager = require('../../commands/CommandManager');
const Database = require('../../Database');
const {Client, CommandInteraction, Constants: {APIErrors}} = require('discord.js');
const monitor = require('../../Monitor').getInstance();
const CommandSource = require('../../commands/CommandSource');
const config = require('../../../config.json');

module.exports = {
    /**
     * @param {Object} options
     * @param {Database} options.database
     * @param {Client} options.bot
     * @param {CommandInteraction} interaction
     * @return {Promise<void>}
     */
    async event(options, interaction) {
        if (!interaction.isCommand() && !interaction.isContextMenu())
            return;

        const name = interaction.commandName;
        /** @type {typeof Command}*/
        const CommandClass = CommandManager.getCommands().get(name);
        if (CommandClass === undefined) {
            await interaction.reply('Unknown command!!');
            return;
        }

        if (CommandClass.guildOnly && !interaction.inGuild()) {
            await interaction.reply('This command can only be used in a guild!');
            return;
        }

        try {
            const cmd = new CommandClass(new CommandSource(interaction), options.database, options.bot, name, '/');

            if (interaction.inGuild()) {
                await cmd._loadConfigs();
                const userPerms = cmd.userHasPerms(), botPerms = cmd.botHasPerms();
                if (userPerms !== true) {
                    await interaction.reply({
                        content: `You are missing the following permissions to execute this command: ${userPerms.join(', ')}`,
                        ephemeral: true,
                    });
                    return;
                }
                if (botPerms !== true) {
                    await interaction.reply({
                        content: `I am missing the following permissions to execute this command: ${botPerms.join(', ')}`,
                        ephemeral: true,
                    });
                    return;
                }
            }

            await cmd.execute();
        } catch (e) {
            if  (e.code === APIErrors.MISSING_PERMISSIONS) {
                await interaction.reply({
                    content: 'I am missing permissions to execute that command!',
                    ephemeral: true,
                });
                if (config.debug.enabled) {
                    console.log('Missing permissions:', e);
                }
            }
            else {
                await monitor.error(`Failed to execute command ${name}`, e);
                console.error(`An error occurred while executing command ${name}:`,e);
                if (e.code !== APIErrors.UNKNOWN_INTERACTION) {
                    await interaction.reply({
                        content: 'An error occurred while executing that command!',
                        ephemeral: true,
                    });
                }
            }
        }
    }
};