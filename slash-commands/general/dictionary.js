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

function trim(input) {
  return input.length > 1024 ? `${input.slice(0, 797)} [...]` : input;
};

const data = new DiscordBuilder.SlashCommandBuilder()
.setName('dictionary')
.setDescription('To search the dictionary for a text or a phrase!')
.addStringOption(option => {
  return option
  .setName('query')
  .setDescription('The text to be searched!')
  .setRequired(true)
});

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
    const text = interaction.options.getString('query');
    const query = encodeURIComponent(text);

    await axios.get(`https://api.urbandictionary.com/v0/define?term=${query}`).then(async res => {
      const list = res.data.list;

      if (!list.length) {
        await wait(2000),
        interaction.editReply({
          content: `We have searched the database, there are no definitions for the word: **${text}**`,
        });
        return;
      }

      const embed = new Discord.MessageEmbed()
      .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
      .setTitle(`Dictionary!`)
      .setColor("WHITE")
      .setDescription(`Here are the ${list.length > 5 ? 5 : list.length} definitions we have collected fot the word: **${text}**!`)
      .setFooter('Dictionary data provided by Urban Dictionary API')

      for (let i = 0; i < (list.length > 5 ? 5 : list.length); i++) {
        embed.addField(`Definition ${i + 1}:`, `${trim(list[i].definition)}\n[Source](${list[i].permalink})`);
      };

      await wait(2000);
      await interaction.editReply({
        embeds: [embed],
      });
    }).catch(err => {
      interaction.editReply({
        content: `There was a problem when searching the database, please report to IcyTea#1760 by \`/error\` or by DM!`,
      });
    });
  },
};

module.exports = commandBase;