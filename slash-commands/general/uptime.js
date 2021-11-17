const Discord = require('discord.js');
const DiscordBuilder = require('@discordjs/builders');
const moment = require('moment');
require('moment-duration-format');

/**
* @typedef CallbackObject
* @property {Discord.CommandInteraction} interaction
* @property {Discord.Client} client
*/

/**
* @typedef CommandOptions
* @property {DiscordBuilder.SlashCommandBuilder} data
* @property {boolean} [testOnly]
* @property {boolean} [ownerOnly]
* @property {Discord.PermissionString[]} [permissions]
* @property {Discord.PermissionString[]} [clientPermissions]
* @property {(obj: CallbackObject) => any} callback
*/

const data = new DiscordBuilder.SlashCommandBuilder()
.setName('uptime')
.setDescription('To display the uptime of the bot!')

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  callback: async ({ interaction, client }) => {
    const uptime = moment.duration(client.uptime).format('D [days] H [hrs] m [mins] s [secs]');

    interaction.reply({
      content: `My uptime is: \`${uptime}\``,
    })
  },
};

module.exports = commandBase;