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
.setName('volume')
.setDescription('To change the volume of the player!')
.addIntegerOption(option => {
  return option
  .setName('number')
  .setDescription('The number of the volume (1 - 100%)')
  .setRequired(false)
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  callback: async ({ interaction, client, manager }) => {
    const { guild, member: intMember } = interaction;

    const member = guild.members.cache.get(intMember.id);

    const voiceChannel = member.voice.channel;

    const player = manager.players.get(guild.id);

    if (!player) {
      return interaction.reply({
        content: 'There is no player for this server!',
        ephemeral: true,
      })
    };

    const volume = interaction.options.getInteger('number');

    if (!volume) {
      return interaction.reply({
        content: `The volume of the player is **${player.volume.toLocaleString()}%**`,
        ephemeral: true,
      })
    };

    if (!voiceChannel) {
      return interaction.reply({
        content: 'Please join a voice channel!',
        ephemeral: true,
      })
    };

    if (voiceChannel.id !== player.voiceChannel) {
      return interaction.reply({
        content: 'You are not in the same voice channel as the bot!',
        ephemeral: true,
      })
    };

    if (!volume || volume < 1 || volume > 100) {
      return interaction.reply({
        content: 'The minimum volume is **1%** and and the maximum volume is **100%**!',
        ephemeral: true,
      })
    };

    player.setVolume(volume);

    interaction.reply({
      content: `The volume of the player is now ${DiscordBuilder.bold(`${volume.toLocaleString()} / 100%`)}!`
    })
  },
};

module.exports = commandBase;