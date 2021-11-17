const Discord = require('discord.js');
const DiscordBuilder = require('@discordjs/builders');

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
 .setName('ping')
 .setDescription('Pong!')

/**
 * @type {CommandOptions}
 */
const commandBase = {
  data, 
  testOnly: false,
  callback: async ({ interaction, client }) => {
    const embed = new Discord.MessageEmbed()
    .setAuthor(interaction.member.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
    .setColor("WHITE")
    .setTitle('Pong!')
    .setDescription(`The ping is: **${client.ws.ping}ms**`)

    interaction.reply({
      embeds: [embed],
    });

    interaction.followUp({
      content: 'Ponggggggggg!!!!!!',
      ephemeral: true,
    })
  },
};

module.exports = commandBase;