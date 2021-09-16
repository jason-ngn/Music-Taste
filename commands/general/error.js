const Discord = require('discord.js');

module.exports = {
  commands: 'error',
  minArgs: 1,
  expectedArgs: '<error>',
  /**
   * 
   * @param {Discord.Message} message 
   * @param {string[]} args 
   * @param {string} text 
   * @param {Discord.Client} client 
   */
  callback: async (message, args, text, client) => {
    const owner = client.users.cache.get(client.owners[0]);

    const error = text;

    message.reply({
      content: `Your error report has been sent to IcyTea#1760! Please wait for a reply!`,
    })

    owner.send({
      content: `Error report from **${message.author.tag}**:\n\n${error}`,
    });
  }
}