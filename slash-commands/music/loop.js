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
.setName('loop')
.setDescription('To loop the song or cancel the loop!')

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

    if (!player.playing && !player.paused) {
      return interaction.reply({
        content: 'There are no songs currently playing!',
        ephemeral: true,
      })
    };

    if (player.trackRepeat === true) {
      interaction.reply({
        content: 'Loop: **Disabled**',
      });
      player.setTrackRepeat(false);
      return;
    } else if (player.trackRepeat === false) {
      interaction.reply({
        content: 'Loop: **Enabled**',
      });
      player.setTrackRepeat(true);
      return;
    }
  },
};

module.exports = commandBase;