const Discord = require('discord.js');
const embedConstructor = require('../../utils/embed-interaction');
const DiscordBuilder = require('@discordjs/builders');
const { Manager } = require('erela.js');
const backId = 'back';
const forwardId = 'forward';
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
.setName('queue')
.setDescription('To show the queue of the player!')

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  callback: async ({ interaction, client, manager }) => {
    const { guild, member } = interaction;

    const player = manager.players.get(guild.id);

    if (!player) {
      return interaction.reply({
        content: 'There is no player for this server!',
        ephemeral: true,
      })
    };

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

    const generateEmbed = async start => {
      const tracks = player.queue.slice(start, start + 10);

      const pageNumber = Math.ceil((start + 10) / 10);
      const maxPages = Math.ceil(player.queue.length / 10);

      const footerText = `Page ${pageNumber.toLocaleString()} of ${maxPages.toLocaleString()} • Queue loop: ${player.queueRepeat === true ? "✅" : "❌"} • Total duration: ${moment.duration(player.queue.duration).format('HH:mm:ss')} • Expires in 1 minute`;

      const embed = embedConstructor(interaction, {
        title: `${guild.name}'s queue!`,
        description: player.queue.length ? (tracks.map((track, i) => (`${(start + (++i))} - [${track.title}](${track.uri}) **[${moment.duration(track.duration).format('HH:mm:ss')}]**\nRequested by: <@${track.requester}>`))).join('\n\n') : 'No tracks in the queue!',
        fields: [
          {
            name: 'Current:',
            value: `[${player.queue.current.title}](${player.queue.current.uri}) **[${moment.duration(player.queue.current.duration).format('HH:mm:ss')}]**\nRequested by: <@${player.queue.current.requester}>`,
          }
        ],
        footer: {
          text: footerText,
        },
        thumbnail: {
          url: guild.iconURL({ dynamic: true })
        }
      });

      return embed;
    };

    const canFitOnOnePage = player.queue.length <= 10;
    const embedMessage = await interaction.reply({
      embeds: [await generateEmbed(0)],
      components: canFitOnOnePage ? [] : [
        new Discord.MessageActionRow({
          components: [
            new Discord.MessageButton()
            .setCustomId(backId)
            .setLabel('')
            .setEmoji('⬅️')
            .setStyle('PRIMARY')
            .setDisabled(true),
            forwardButton
          ]
        })
      ],
      fetchReply: true,
    });

    if (canFitOnOnePage) return;

    const collector = embedMessage.createMessageComponentCollector({
      filter: i => i.user.id === member.user.id,
      time: 60000,
    });

    let currentIndex = 0;
    collector.on('collect', async i => {
      i.customId === backId ? (currentIndex -= 10) : (currentIndex += 10);

      await i.update({
        embeds: [await generateEmbed(currentIndex)],
        components: [
          new Discord.MessageActionRow({
            components: [
              ...(currentIndex ? [backButton] : [
                new Discord.MessageButton()
                .setCustomId(backId)
                .setLabel('')
                .setEmoji('⬅️')
                .setStyle('PRIMARY')
                .setDisabled(true)
              ]),
              ...(currentIndex + 10 < player.queue.length ? [forwardButton] : [
                new Discord.MessageButton()
                .setCustomId(forwardId)
                .setLabel('')
                .setEmoji('➡️')
                .setStyle('PRIMARY')
                .setDisabled(true)
              ])
            ]
          })
        ]
      })
    });

    collector.on('end', async collected => {
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