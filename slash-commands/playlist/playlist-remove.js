const Discord = require('discord.js');
const embedConstructor = require('../../utils/embed-interaction');
const DiscordBuilder = require('@discordjs/builders');
const { Manager } = require('erela.js');
const tracks = [];
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
.setName('playlistremove')
.setDescription('To remove a song from your playlist!')
.addIntegerOption(option => {
  return option
  .setName('number')
  .setDescription('The number of the song from the playlist')
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

    const author = member.user;

    const playlist = await playlistSchema.findOne({
      userId: author.id,
    });

    if (!playlist && !playlist.tracks.length) {
      return interaction.reply({
        content: 'Your playlist is empty!',
        ephemeral: true,
      })
    };

    if (!tracks.length) {
      tracks.push(...playlist.tracks);
    };

    const number = interaction.options.getInteger('number');

    if (number > tracks.length) {
      return interaction.reply({
        content: `I can't find that song in your playlist!`,
        ephemeral: true,
      })
    };

    const tracksSplited = tracks.splice(number - 1);
    const trackDeleted = tracksSplited.splice(0, 1);

    for (const track of tracksSplited) {
      track.number = track.number - 1;
    };

    tracks.push(...tracksSplited);

    await playlistSchema.findOneAndUpdate(
      {
        userId: author.id,
      },
      {
        userId: author.id,
        tracks,
      },
      {
        upsert: true,
      }
    );

    const e = embedConstructor(interaction, {
      thumbnail: {
        url: trackDeleted[0].thumbnail,
      },
      title: `Song #${trackDeleted[0].number} deleted`,
      description: `[${trackDeleted[0].title}](${trackDeleted[0].uri}) has been removed from your playlist successfully!`,
    });

    interaction.reply({
      embeds: [e],
    })
  },
};

module.exports = commandBase;