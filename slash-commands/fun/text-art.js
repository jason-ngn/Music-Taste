const Discord = require('discord.js');
const DiscordBuilder = require('@discordjs/builders');
const figlet = require('figlet');

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
.setName('textart')
.setDescription('To display a text with some art!')
.addStringOption(option => {
  return option
  .setName('text')
  .setDescription(`The text that is going to be displayed!`)
  .setRequired(true)
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  callback: async ({ interaction, client }) => {
    const text = interaction.options.getString('text');
    figlet.text(text, {
      font: '',
    }, async (err, data) => {
      interaction.reply({
        content: `\`\`\`${data}\`\`\``
      })
    })
  },
};

module.exports = commandBase;