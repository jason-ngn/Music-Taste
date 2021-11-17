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
* @property {boolean} [djOnly]
* @property {Discord.PermissionString[]} [permissions]
* @property {Discord.PermissionString[]} [clientPermissions]
* @property {(obj: CallbackObject) => any} callback
*/

const data = new DiscordBuilder.SlashCommandBuilder()
.setName('search')
.setDescription('To search for a song!')
.addStringOption(option => {
  return option
  .setName('query')
  .setDescription('A link or query for the bot to search for!')
  .setRequired(true)
});

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  callback: async ({ interaction, client, manager }) => {
    const { guild, member: intMember } = interaction;

    const member = guild.members.cache.get(intMember.id);

    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return await interaction.reply({
        content: `Please join a voice channel!`,
        ephemeral: true,
      });
    };

    const text = interaction.options.getString('query');

    const res = await manager.search(
      text,
      member.user,
    );

    let player = manager.players.get(guild.id);

    if (!player) {
      player = await manager.create({
        guild: guild.id,
        textChannel: interaction.channel.id,
        voiceChannel: voiceChannel.id,
      });
    };

    const tracks = res.tracks.length > 10 ? res.tracks.splice(0, 9) : res.tracks;

    const embed = embedConstructor(interaction, {
      title: 'Here are a list of songs!',
      description: tracks.map((track, i) => `${i + 1} - [${track.title}](${track.uri}) **[${track.author}] [${moment.duration(track.duration).format('HH:mm:ss')}]**`).join('\n\n'),
      footer: {
        text: `Please type the number of the song you would like to listen to!`
      }
    });

    const embedMessage = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
    });

    const collector = interaction.channel.createMessageCollector({
      filter: m => m.author.id === member.user.id,
      max: 1,
    });

    collector.on('end', async collected => {
      const content = collected.first().content;

      const number = parseInt(content);

      if (number > tracks.length) {
        return await interaction.followUp({
          content: `That is an invalid choice, please try again!`,
          ephemeral: true,
        })
      };

      const index = number - 1;

      const trackAdded = tracks[index];

      player.queue.add(trackAdded);

      const songEmbed = embedConstructor(interaction, {
        description: `Queued [${trackAdded.title}](${trackAdded.uri})\nRequested by ${trackAdded.requester}`,
        thumbnail: {
          url: trackAdded.displayThumbnail(1500),
        }
      });

      await interaction.followUp({
        embeds: [songEmbed],
      });

      if (player.state === 'CONNECTED') {
        if (!player.playing && !player.paused) {
          player.play();
        }
      } else if (player.state === 'DISCONNECTED') {
        player.connect();
        player.play();
      }
    })
  },
};

module.exports = commandBase;