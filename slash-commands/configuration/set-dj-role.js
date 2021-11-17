const Discord = require('discord.js');
const embedConstructor = require('../../utils/embed-interaction');
const DiscordBuilder = require('@discordjs/builders');
const { Manager } = require('erela.js');
const { updateDJRole } = require('../../handlers/slash-command-handler');

/**
* @typedef CallbackObject
* @property {Discord.CommandInteraction} interaction
* @property {Discord.Client} client
* @property {Manager} manager
*/

/**
* @typedef CommandOptions
* @property {DiscordBuilder.SlashCommandBuilder} data
* @property {boolean} [testOnly]
* @property {boolean} [ownerOnly]
* @property {boolean} [djOnly]
* @property {Discord.PermissionString[]} [permissions]
* @property {Discord.PermissionString[]} [clientPermissions]
* @property {(obj: CallbackObject) => any} callback
*/

const data = new DiscordBuilder.SlashCommandBuilder()
.setName('djrole')
.setDescription('To set the DJ role for the server')
.addRoleOption(option => {
  return option
  .setName('role')
  .setDescription('The DJ role')
  .setRequired(true)
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  djOnly: true,
  permissions: ['ADMINISTRATOR'],
  callback: async ({ interaction, client, manager }) => {
    await interaction.deferReply({
      ephemeral: true,
    })
    const { guild, member: intMember } = interaction;

    const role = interaction.options.getRole('role');

    await updateDJRole(guild.id, role.id);

    await interaction.editReply({
      content: `The DJ role is now: **${role.name}**!`,
    });
  },
};

module.exports = commandBase;