const Discord = require('discord.js');
const DiscordBuilder = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

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
.setName('error')
.setDescription('To report to IcyTea#1760 for an error')
.addStringOption(option => {
  return option
  .setName('error')
  .setDescription('The error that you want to report')
  .setRequired(true)
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  callback: async ({ interaction, client }) => {
    await interaction.deferReply({
      ephemeral: true,
    });
    const owner = client.users.cache.get(client.owners[0]);

    const error = interaction.options.getString('error');

    await wait(2000);
    await interaction.editReply({
      content: `Your error report has been sent to IcyTea#1760! Please wait for a reply!`,
    });

    owner.send({
      content: `Error report from **${interaction.user.tag}**:\n\n${error}`,
    });
  },
};

module.exports = commandBase;