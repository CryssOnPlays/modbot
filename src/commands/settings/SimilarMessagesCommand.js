const ConfigCommand = require('../ConfigCommand');

class SimilarMessagesCommand extends ConfigCommand {

    static description = 'Configure message repeated message protection (deletes similar messages)';

    static usage = 'get|set|disable';

    static comment = 'Count is the number of similar messages(1-60) a user is allowed to send per minute.';

    static names = ['similarmessages'];

    static userPerms = ['MANAGE_GUILD'];

    static getSubCommands() {
        return [
            require('./similarmessages/GetSimilarMessages'),
            require('./similarmessages/SetSimilarMessages'),
            require('./similarmessages/DisableSimilarMessages'),
        ];
    }
}

module.exports = SimilarMessagesCommand;
