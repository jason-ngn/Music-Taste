const Discord = require('discord.js');
const embedConstructor = require('../../utils/embed-interaction');
const DiscordBuilder = require('@discordjs/builders');
const { Manager } = require('erela.js');
const moment = require('moment');
require('moment-duration-format');

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
.setName('nowplaying')
.setDescription('To show the current playing song!')

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  callback: async ({ interaction, client, manager }) => {
    const { guild } = interaction;

    const player = manager.players.get(guild.id);

    if (!player) {
      return interaction.reply({
        content: 'There is no player for this server!',
        ephemeral: true,
      })
    }

    if (!player.queue.current) {
      return interaction.reply({
        content: 'There are no songs currently playing!',
        ephemeral: true,
      })
    };

    const currentSong = player.queue.current;

    const durationTime = moment.duration(currentSong.duration).format('hh:mm:ss');

    const nowPlayingEmbed = embedConstructor(interaction, {
      title: 'Currently playing',
      thumbnail: {
        url: currentSong.displayThumbnail(1500)
      },
      fields: [
        {
          name: 'Title:',
          value: `[${currentSong.title}](${currentSong.uri})`
        },
        {
          name: 'Requested by:',
          value: `<@${currentSong.requester}>`,
          inline: true,
        },
        {
          name: 'Duration:',
          value: `\`${moment.duration(player.position).format('HH:mm:ss')} / ${durationTime}\``,
          inline: true,
        },
        {
          name: 'Author:',
          value: currentSong.author,
          inline: true,
        },
        {
          name: 'Volume:',
          value: `\`${player.volume} / 100\``,
          inline: true,
        },
        {
          name: 'Bassboost level:',
          value: `\`${player.bands[0]} / 1.00\``,
          inline: true,
        },
        {
          name: 'Loop:',
          value: player.trackRepeat === true ? 'True' : 'False',
          inline: true,
        }
      ]
    });

    interaction.reply({
      embeds: [nowPlayingEmbed],
    })
  },  
};

module.exports = commandBase;