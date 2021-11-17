const Discord = require('discord.js');
const embedConstructor = require('../../utils/embed-interaction');
const DiscordBuilder = require('@discordjs/builders');
const { Manager } = require('erela.js');

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
* @property {Discord.PermissionString[]} [permissions]
* @property {Discord.PermissionString[]} [clientPermissions]
* @property {(obj: CallbackObject) => any} callback
*/

const data = new DiscordBuilder.SlashCommandBuilder()
.setName('invite')
.setDescription('To show the invite link of the bot!')

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  callback: async ({ interaction, client, manager }) => {
    const inviteLink = 'https://discord.com/api/oauth2/authorize?client_id=815845605876301854&permissions=8&scope=bot%20applications.commands';

    const button = new Discord.MessageButton({
      style: 'LINK',
      url: inviteLink,
      label: `${client.user.username}'s invite link!`,
    })

    const embed = embedConstructor(interaction, {
      description: `Please click the button below for the invite link!`,
    });

    interaction.reply({
      embeds: [embed],
      components: [
        new Discord.MessageActionRow({
          components: [button],
        })
      ]
    })
  },
};

module.exports = commandBase;