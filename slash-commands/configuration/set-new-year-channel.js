const Discord = require('discord.js');
const embedConstructor = require('../../utils/embed-interaction');
const DiscordBuilder = require('@discordjs/builders');
const { Manager } = require('erela.js');
const newYearSchema = require('../../schemas/new-year-counter-schema');

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
.setName('newyearchannel')
.setDescription('To set the channel for the New Year Counter!')
.addChannelOption(option => {
  return option
  .setName('channel')
  .setDescription('The counter channel!')
  .setRequired(false)
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  callback: async ({ interaction, client, manager }) => {
    await interaction.deferReply({
      ephemeral: true,
    })
    const { guild } = interaction;

    const channel = interaction.options.getChannel('channel');

    if (!channel) {
      const result = await newYearSchema.findOne({
        guildId: guild.id,
      });

      if (!result) {
        return await interaction.editReply({
          content: "A New Year Counter hasn't been set up in this server!",
          
        })
      };

      await interaction.editReply({
        content: `The New Year Counter's channel is: <#${result.channelId}>!`,
        
      });

      return;
    };

    if (channel.type !== 'GUILD_TEXT') {
      return await interaction.editReply({
        content: "Please tag a text channel!",
        
      })
    };

    await newYearSchema.findOneAndUpdate(
      {
        guildId: guild.id,
      },
      {
        guildId: guild.id,
        channelId: channel.id,
      },
      {
        upsert: true,
      }
    );

    return await interaction.editReply({
      content: `The New Year Counter's channel has been set to: ${channel}`,
      
    });
  },
};

module.exports = commandBase;