const Discord = require('discord.js');
const newYearSchema = require('../../schemas/new-year-counter-schema');

module.exports = {
  commands: 'setnewyearchannel',
  minArgs: 1,
  maxArgs: 1,
  expectedArgs: '<#channel tag>',
  permissions: [
    'ADMINISTRATOR'
  ],
  /**
   * 
   * @param {Discord.Message} message 
   * @param {string[]} args 
   * @param {string} text 
   * @param {Discord.Client} client 
   */
  callback: async (message, args, text, client) => {
    const { guild } = message;

    let targetChannel = args[0];

    if (targetChannel.includes('<#')) {
      targetChannel = targetChannel.replace('<#', '').replace('>', '');
    };

    const validChannel = guild.channels.cache.get(targetChannel);

    if (!validChannel) {
      return message.reply(`Please tag a valid channel!`);
    };

    if (validChannel.type !== 'GUILD_TEXT') {
      return message.reply(`Please tag a text channel!`);
    };

    await newYearSchema.findOneAndUpdate(
      {
        guildId: guild.id,
      },
      {
        guildId: guild.id,
        channelId: validChannel.id,
      },
      {
        upsert: true,
      }
    );

    message.reply({
      content: `The new year counter channel has been set to <#${validChannel.id}>!`,
    })
  }
}