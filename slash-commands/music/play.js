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
.setName('play')
.setDescription('To play a song!')
.addStringOption(option => {
  return option
  .setName('query')
  .setDescription('A query or link to search for!')
  .setRequired(true)
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  clientPermissions: ['CONNECT', 'SPEAK'],
  callback: async ({ interaction, client, manager }) => {
    const { guild, member: intMember, user } = interaction;

    const member = guild.members.cache.get(intMember.id);

    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return await interaction.reply({
        content: 'Please join a voice channel!',
        ephemeral: true,
      })
    };

    const text = interaction.options.getString('query');

    const res = await manager.search(
      text,
      user,
    );

    let player = manager.players.get(guild.id);

    if (!player) {
      player = await manager.create({
        guild: guild.id,
        textChannel: interaction.channel.id,
        voiceChannel: voiceChannel.id,
      });
    }

    player.queue.add(res.tracks[0]);

    const embed = embedConstructor(interaction, {
      description: `Queued [${res.tracks[0].title}](${res.tracks[0].uri})\nRequested by ${res.tracks[0].requester}`,
      thumbnail: {
        url: res.tracks[0].displayThumbnail(1500),
      }
    });

    interaction.reply({
      embeds: [embed],
    })

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