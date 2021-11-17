const Discord = require('discord.js');
const DiscordBuilder = require('@discordjs/builders');
const axios = require('axios').default;

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
.setName('decode')
.setDescription('To decode a string of binary!')
.addStringOption(option => {
  return option
  .setName('binary')
  .setDescription('The string of binary!')
  .setRequired(true);
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  callback: async ({ interaction, client }) => {
    const text = interaction.options.getString('binary');

    const url = `https://some-random-api.ml/binary?decode=${encodeURIComponent(text)}`;

    const decodedText = await axios.get(url).then(res => {
      return res.data
    });

    const embed = new Discord.MessageEmbed()
    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
    .setTitle(`Binary to Text Converter!`)
    .setColor("WHITE")
    .setDescription(`The text is: **${decodedText.text}**`)
    .setTimestamp();

    interaction.reply({
      embeds: [embed],
    })
  },
};

module.exports = commandBase;