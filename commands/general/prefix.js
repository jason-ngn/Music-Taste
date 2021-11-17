const commandHandler = require('../../handlers/command-handler');

module.exports = {
  commands: ['prefix', 'setprefix'],
  minArgs: 1,
  maxArgs: 1,
  expectedArgs: '<prefix>',
  permissions: ['ADMINISTRATOR'],
  callback: async (message, args, text) => {
    await commandHandler.updatePrefixCache(message.guild, text);

    message.reply(`${message.guild.name}'s prefix is now: \`${text}\``);
  }
};