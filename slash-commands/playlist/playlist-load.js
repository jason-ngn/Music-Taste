const Discord = require('discord.js');
const embedConstructor = require('../../utils/embed-interaction');
const DiscordBuilder = require('@discordjs/builders');
const { Manager } = require('erela.js');
const playlistSchema = require('../../schemas/playlist-schema');

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
.setName('playlistload')
.setDescription('To load your playlist into the queue!')

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  callback: async ({ interaction, client, manager }) => {
    await interaction.deferReply({
      ephemeral: true,
    })
    const { guild, member: intMember } = interaction;

    const member = guild.members.cache.get(intMember.id);

    const { channel } = member.voice;

    if (!channel) {
      return interaction.editReply({
        content: 'Please join a voice channel!',
      })
    };

    let player = manager.players.get(guild.id);

    if (!player) {
      player = await manager.create({
        guild: guild.id,
        voiceChannel: channel.id,
        textChannel: interaction.channel.id,
      });
    };

    const playlist = await playlistSchema.findOne({
      userId: member.user.id,
    });

    if (!playlist) {
      return interaction.editReply({
        content: 'Your playlist is empty!',
      })
    };

    await interaction.editReply({
      content: 'Loading your playlist...',
    });

    for (const track of playlist.tracks) {
      const res = await manager.search(
        track.uri,
        member.user.id,
      );

      if (typeof track !== 'undefined') {
        player.queue.add(res.tracks[0]);
      }
    };

    const e = embedConstructor(interaction, {
      description: `${playlist.tracks.length.toLocaleString()} songs added to the queue successfully!`,
    });

    await interaction.followUp({
      embeds: [e],
      ephemeral: true,
    });

    if (player.state === 'CONNECTED') {
      if (!player.playing && !player.paused) {
        player.play();
      }
    } else if (player.state === 'DISCONNECTED') {
      player.connect();
      player.play();
    }
  },
};

module.exports = commandBase;