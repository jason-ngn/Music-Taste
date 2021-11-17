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
.setName('skipto')
.setDescription('To skip to a specific song in the queue!')
.addIntegerOption(option => {
  return option
  .setName('number')
  .setDescription('The number of the song in the queue!')
  .setRequired(true)
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
        content: 'There is no song for this server!',
        ephemeral: true,
      })
    };

    if (voiceChannel.id !== player.voiceChannel) {
      return interaction.reply({
        content: 'You are not in the same voice channel as the bot!',
        ephemeral: true,
      })
    };

    const number = interaction.options.getInteger('number');

    if (number === 0) {
      return interaction.reply({
        content: `Can't skip to a song that is already playing!`,
        ephemeral: true,
      })
    };

    if ((number > player.queue.length) || (number && !player.queue[number - 1])) {
      return interaction.reply({
        content: `I can't find that song in the queue!`,
        ephemeral: true,
      })
    };

    const { title, uri, requester, displayThumbnail } = player.queue[number - 1];

    if (number === 1) return player.stop();

    player.queue.splice(0, number - 1);
    player.stop();

    const e = embedConstructor(interaction, {
      description: `Skipped to [${title}](${uri})\nRequested by: ${requester}`,
      thumbnail: {
        url: displayThumbnail(1500),
      }
    });

    interaction.reply({
      embeds: [e],
    });
  },
};

module.exports = commandBase;