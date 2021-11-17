const Discord = require('discord.js');
const DiscordBuilder = require('@discordjs/builders');
const axios = require('axios').default;
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
.setName('encode')
.setDescription('To encode a string of text!')
.addStringOption(option => {
  return option
  .setName('text')
  .setDescription('The string of text!')
  .setRequired(true)
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  callback: async ({ interaction, client }) => {
    await interaction.deferReply();
    const text = interaction.options.getString('text');

    const url = `https://some-random-api.ml/binary?text=${encodeURIComponent(text)}`;

    const data = await axios.get(url).then(res => {
      return res.data;
    });

    const embed = new Discord.MessageEmbed()
    .setTitle('Text to Binary Converter!')
    .setColor('WHITE')
    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
    .setDescription(`The converted binary is: \`${data.binary}\``)
    .setTimestamp()

    await wait(2000);
    await interaction.editReply({
      embeds: [embed],
    })
  },
};

module.exports = commandBase;