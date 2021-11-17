const Discord = require('discord.js');
const embedConstructor = require('../../utils/embed-interaction');
const DiscordBuilder = require('@discordjs/builders');
const { Manager } = require('erela.js');
const moment = require('moment');
require('moment-duration-format');
const fastForwardNum = 10;

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
.setName('seek')
.setDescription('To seek to a time in the song!')
.addStringOption(option => {
  return option
  .setName('time')
  .setDescription('The time that you want to seek to!')
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

    if (!voiceChannel) {
      return interaction.reply({
        content: 'Please join a voice channel!',
        ephemeral: true,
      })
    };

    const player = manager.players.get(guild.id);

    if (!player) {
      return interaction.reply({
        content: 'There is no player for this server!',
        ephemeral: true,
      })
    };

    if (voiceChannel.id !== player.voiceChannel) {
      return interaction.reply({
        content: 'You are not in the same voice channel as the bot!',
        ephemeral: true,
      })
    };

    const timeArg = interaction.options.getString('time');

    if (timeArg) {
      if (!timeArg.includes(':')) {
        return interaction.reply({
          content: 'Incorrect format! Please use: `HH:MM:SS`',
          ephemeral: true,
        })
      };

      const time = moment.duration(timeArg).asSeconds();

      if ((time * 1000) < player.queue.current.duration) {
        player.seek(time * 1000);
        const parsedDuration = moment.duration(player.position).format('hh:mm:ss');

        return interaction.reply({
          content: `Seeked to \`${parsedDuration}\``,
        })
      } else {
        return interaction.reply({
          content: 'Can\'t seek beyond the song\'s duration!',
          ephemeral: true,
        })
      };
    };

    if (!timeArg) {
      if ((player.position + fastForwardNum * 1000) < player.queue.current.duration) {
        player.seek(player.position + fastForwardNum * 1000);

        const parsedDuration = moment.duration(player.position).format('hh:mm:ss');
        return interaction.reply({
          content: `Seeked to \`${parsedDuration}\``,
        })
      } else {
        return interaction.reply({
          content: `Can't seek beyond the song's duration!`,
          ephemeral: true,
        })
      }
    }
  },
};

module.exports = commandBase;