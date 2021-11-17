const Discord = require('discord.js');
const embedConstructor = require('../../utils/embed-interaction');
const DiscordBuilder = require('@discordjs/builders');
const { Manager } = require('erela.js');
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
* @property {boolean} [djOnly]
* @property {Discord.PermissionString[]} [permissions]
* @property {Discord.PermissionString[]} [clientPermissions]
* @property {(obj: CallbackObject) => any} callback
*/

const data = new DiscordBuilder.SlashCommandBuilder()
.setName('playlistadd')
.setDescription('Add a song into your playlist!')
.addIntegerOption(option => {
  return option
  .setName('queue-number')
  .setDescription(`The song's number in the queue!`)
  .setRequired(false);
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  callback: async ({ interaction, client, manager }) => {
    await interaction.deferReply();

    const { guild, member: intMember } = interaction;

    const member = guild.members.cache.get(intMember.id);

    const { channel } = member.voice;

    const player = manager.players.get(guild.id);

    if (!player) {
      return interaction.editReply({
        content: `There is no player for **${guild.name}**!`,
      })
    };

    const number = interaction.options.getInteger('queue-number');

    const numbers = await playlistSchema.findOne({ userId: member.user.id });

    if (number) {
      const index = number - 1;

      const track = player.queue[index];

      if (!track) {
        return interaction.editReply({
          content: "That track is not valid!"
        })
      };

      const trackToBePushed = {
        number: numbers && numbers.tracks.length > 0 ? numbers.tracks.length + 1 : 1,
        title: track.title,
        uri: track.uri,
        author: track.author,
        duration: track.duration,
        thumbnail: track.thumbnail,
      };

      if (numbers && numbers.tracks.length > 0) {
        const filteredTrack = numbers.tracks.find(track => {
          return track.uri === trackToBePushed.uri && track.title === trackToBePushed.title;
        });

        if (filteredTrack) {
          const alreadyAddedEmbed = embedConstructor(interaction, {
            description: `[${trackToBePushed.title}](${trackToBePushed.uri}) had been added to your playlist before! Do you want to add anyway?`,
          });

          const row = new Discord.MessageActionRow()
          .addComponents(
            new Discord.MessageButton()
            .setCustomId('yes')
            .setLabel('YES')
            .setStyle("SUCCESS"),
            new Discord.MessageButton()
            .setCustomId('no')
            .setLabel('NO')
            .setStyle('DANGER')
          );

          await interaction.editReply({
            embeds: [alreadyAddedEmbed],
            components: [row],
          })
          .then(async () => {
            const collector = interaction.channel.createMessageComponentCollector({
              filter: i => i.user.id === member.user.id && ['yes', 'no'].includes(i.customId),
              max: 1,
              componentType: 'BUTTON',
            });

            collector.on('end', async i => {
              const button = i.first();

              const id = button.customId;

              if (id === 'yes') {
                await playlistSchema.findOneAndUpdate(
                  {
                    userId: member.user.id,
                  },
                  {
                    userId: member.user.id,
                    $push: {
                      tracks: trackToBePushed,
                    }
                  },
                  {
                    upsert: true,
                  }
                );

                const addedEmbed = embedConstructor(interaction, {
                  description: `[${trackToBePushed.title}](${trackToBePushed.uri}) has been added to your playlist!`,
                });

                await button.update({
                  embeds: [addedEmbed],
                  components: [],
                });

                const e = embedConstructor(interaction, {
                  title: `Song #${trackToBePushed.number}`,
                  description: `[${trackToBePushed.title}](${trackToBePushed.uri})`,
                  thumbnail: {
                    url: trackToBePushed.thumbnail
                  },
                  fields: [
                    {
                      name: 'Author:',
                      value: trackToBePushed.author,
                      inline: true,
                    },
                    {
                      name: 'Duration:',
                      value: `\`${moment.duration(trackToBePushed.duration).format('HH:mm:ss')}\``,
                      inline: true,
                    }
                  ]
                });

                return member.user.send({
                  embeds: [e],
                });
              } else if (id === 'no') {
                const notAddedEmbed = embedConstructor(interaction, {
                  description: 'Alright, we got it!',
                });

                return button.update({
                  embeds: [notAddedEmbed],
                  components: [],
                });
              }
            })
          });
        };
      };

      await playlistSchema.findOneAndUpdate(
        {
          userId: member.user.id,
        },
        {
          userId: member.user.id,
          $push: {
            tracks: trackToBePushed,
          }
        },
        {
          upsert: true,
        }
      );

      const e = embedConstructor(interaction, {
        title: `Song #${trackToBePushed.number}`,
        description: `[${trackToBePushed.title}](${trackToBePushed.uri})`,
        thumbnail: {
          url: trackToBePushed.thumbnail
        },
        fields: [
          {
            name: 'Author:',
            value: trackToBePushed.author,
            inline: true,
          },
          {
            name: 'Duration:',
            value: `\`${moment.duration(trackToBePushed.duration).format('HH:mm:ss')}\``,
            inline: true,
          }
        ]
      });

      await interaction.editReply({
        content: 'Success! Please check your DMs!',
      });

      return member.user.send({
        embeds: [e],
      });
    };

    const track = player.queue.current;

    if (!track) {
      return interaction.editReply({
        content: 'There is no song currently playing!',
      })
    };

    const trackToBePushed = {
      number: numbers && numbers.tracks.length > 0 ? numbers.tracks.length + 1 : 1,
      title: track.title,
      uri: track.uri,
      author: track.author,
      duration: track.duration,
      thumbnail: track.thumbnail,
    };

    if (numbers && numbers.tracks.length > 0) {
      const filteredTrack = numbers.tracks.find(track => {
        return track.uri === trackToBePushed.uri && track.title === trackToBePushed.title;
      });

      if (filteredTrack) {
        const alreadyAddedEmbed = embedConstructor(interaction, {
          description: `[${trackToBePushed.title}](${trackToBePushed.uri}) had been added to your playlist before! Do you want to add anyway?`,
        });

        const row = new Discord.MessageActionRow()
        .addComponents(
          new Discord.MessageButton()
          .setCustomId('yes')
          .setLabel('YES')
          .setStyle("SUCCESS"),
          new Discord.MessageButton()
          .setCustomId('no')
          .setLabel('NO')
          .setStyle('DANGER')
        );

        await interaction.editReply({
          embeds: [alreadyAddedEmbed],
          components: [row],
        })
        .then(async () => {
          const collector = interaction.channel.createMessageComponentCollector({
            filter: i => i.user.id === member.user.id && ['yes', 'no'].includes(i.customId),
            max: 1,
            componentType: 'BUTTON',
          });

          collector.on('end', async i => {
            const button = i.first();

            const id = button.customId;

            if (id === 'yes') {
              await playlistSchema.findOneAndUpdate(
                {
                  userId: member.user.id,
                },
                {
                  userId: member.user.id,
                  $push: {
                    tracks: trackToBePushed,
                  }
                },
                {
                  upsert: true,
                }
              );

              const addedEmbed = embedConstructor(interaction, {
                description: `[${trackToBePushed.title}](${trackToBePushed.uri}) has been added to your playlist!`,
              });

              await button.update({
                embeds: [addedEmbed],
                components: [],
              });

              const e = embedConstructor(interaction, {
                title: `Song #${trackToBePushed.number}`,
                description: `[${trackToBePushed.title}](${trackToBePushed.uri})`,
                thumbnail: {
                  url: trackToBePushed.thumbnail
                },
                fields: [
                  {
                    name: 'Author:',
                    value: trackToBePushed.author,
                    inline: true,
                  },
                  {
                    name: 'Duration:',
                    value: `\`${moment.duration(trackToBePushed.duration).format('HH:mm:ss')}\``,
                    inline: true,
                  }
                ]
              });

              return member.user.send({
                embeds: [e],
              });
            } else if (id === 'no') {
              const notAddedEmbed = embedConstructor(interaction, {
                description: 'Alright, we got it!',
              });

              return button.update({
                embeds: [notAddedEmbed],
                components: [],
              });
            }
          })
        });
        return;
      };
    };

    await playlistSchema.findOneAndUpdate(
      {
        userId: member.user.id,
      },
      {
        userId: member.user.id,
        $push: {
          tracks: trackToBePushed,
        }
      },
      {
        upsert: true,
      }
    );

    const e = embedConstructor(interaction, {
      title: `Song #${trackToBePushed.number}`,
      description: `[${trackToBePushed.title}](${trackToBePushed.uri})`,
      thumbnail: {
        url: trackToBePushed.thumbnail
      },
      fields: [
        {
          name: 'Author:',
          value: trackToBePushed.author,
          inline: true,
        },
        {
          name: 'Duration:',
          value: `\`${moment.duration(trackToBePushed.duration).format('HH:mm:ss')}\``,
          inline: true,
        }
      ]
    });

    await interaction.editReply({
      content: 'Success! Please check your DMs!',
    });

    return member.user.send({
      embeds: [e],
    });
  },
};

module.exports = commandBase;