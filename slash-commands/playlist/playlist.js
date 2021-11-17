const Discord = require('discord.js');
const embedConstructor = require('../../utils/embed-interaction');
const DiscordBuilder = require('@discordjs/builders');
const { Manager } = require('erela.js');
const backId = 'back';
const forwardId = 'forward';
const playlistSchema = require('../../schemas/playlist-schema');
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
.setName('playlist')
.setDescription('To show your playlist or another user\'s playlist!')
.addUserOption(option => {
  return option
  .setName('user')
  .setDescription('The user you would like to see the playlist!')
  .setRequired(false)
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  callback: async ({ interaction, client, manager }) => {
    await interaction.deferReply();
    const { guild, member: intMember } = interaction;

    const member = guild.members.cache.get(intMember.id);

    const backButton = new Discord.MessageButton()
    .setCustomId(backId)
    .setLabel('')
    .setEmoji('⬅️')
    .setStyle('PRIMARY')
    
    const forwardButton = new Discord.MessageButton()
    .setCustomId(forwardId)
    .setLabel('')
    .setEmoji('➡️')
    .setStyle('PRIMARY')

    const target = interaction.options.getUser('user') || member.user;

    if (target.bot) {
      return interaction.editReply({
        content: `That user is a bot, and bots can't listen to music...`,
        
      })
    }

    const playlist = await playlistSchema.findOne({
      userId: target.id
    });

    if (!playlist || (playlist && !playlist.tracks.length)) {
      return interaction.editReply({
        content: `${target.id !== member.user.id ? `**${target.username}**` : 'You'} do not have any songs in ${target.id !== member.user.id ? `their` : 'your'} playlist!`,
        
      })
    };

    const generateEmbed = async start => {
      const tracks = playlist.tracks.slice(start, start + 10);

      const pageNumber = Math.ceil((start + 10) / 10);
      const maxPages = Math.ceil(playlist.tracks.length / 10);

      const embed = embedConstructor(interaction, {
        title: `${target.username}'s playlist!`,
        thumbnail: {
          url: target.displayAvatarURL({ dynamic: true })
        },
        description: tracks.map(track => (`${track.number.toLocaleString()} - [${track.title}](${track.uri}) **[${track.author}] [${moment.duration(track.duration).format('HH:mm:ss')}]**`)).join('\n\n'),
        footer: {
          text: `Page ${pageNumber.toLocaleString()} of ${maxPages.toLocaleString()} • Expires in 1 minute`,
        }
      });

      return embed;
    };

    const canFitOnOnePage = playlist.tracks.length <= 10;
    const embedMessage = await interaction.editReply({
      embeds: [await generateEmbed(0)],
      components: canFitOnOnePage ? [] : [new Discord.MessageActionRow({
        components: [new Discord.MessageButton().setDisabled(true).setLabel('').setEmoji('⬅️').setStyle('PRIMARY').setCustomId(backId), forwardButton]
      })],
      fetchReply: true,
    });

    if (canFitOnOnePage) return;

    const collector = embedMessage.createMessageComponentCollector({
      filter: i => i.user.id === member.user.id,
      time: 60000
    });

    let currentIndex = 0;
    collector.on('collect', async i => {
      i.customId === backId ? (currentIndex -= 10) : (currentIndex += 10);

      await i.update({
        embeds: [await generateEmbed(currentIndex)],
        components: [
          new Discord.MessageActionRow({
            components: [
              ...(currentIndex ? [backButton] : [new Discord.MessageButton().setDisabled(true).setLabel('').setEmoji('⬅️').setStyle('PRIMARY').setCustomId(backId)]),
              ...(currentIndex + 10 < playlist.tracks.length ? [forwardButton] : [new Discord.MessageButton().setDisabled(true).setLabel('').setEmoji('➡️').setStyle('PRIMARY').setCustomId(forwardId)])
            ]
          })
        ]
      })
    });

    collector.on('end', async collected => {
      const button = collected.first();

      await embedMessage.edit({
        embeds: [await generateEmbed(currentIndex)],
        components: [
          new Discord.MessageActionRow({
            components: [
              backButton.setDisabled(true),
              forwardButton.setDisabled(true),
            ]
          })
        ]
      })
    })
  },
};

module.exports = commandBase;