const Discord = require('discord.js');
const DiscordBuilder = require('@discordjs/builders');
const translate = require('@vitalets/google-translate-api');
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
.setName('translate')
.setDescription('To translate a text!')
.addStringOption(option => {
  return option
  .setName('text')
  .setDescription('The text!')
  .setRequired(true)
})
.addStringOption(option => {
  return option
  .setName('country')
  .setDescription('The ISO Code of that country!')
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
    const country = interaction.options.getString('country');

    await translate(text, {
      to: country,
    })
    .then(async res => {
      const translatedText = res.text;

      const embed = new Discord.MessageEmbed()
      .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
      .setColor("WHITE")
      .setTitle('Translation!')
      .addField('Detect language to:', text, true)
      .addField(country.toUpperCase(), translatedText, true)
      .setTimestamp();

      await interaction.reply({
        embeds: [embed],
      })
    })
    .catch(async () => {
      await interaction.reply({
        content: `There was a problem when translating! Please try again!`,
        ephemeral: true,
      });
    })
  },
};

module.exports = commandBase;