const Discord = require('discord.js');
const embedConstructor = require('../../utils/embed-interaction');
const DiscordBuilder = require('@discordjs/builders');
const { Manager } = require('erela.js');
const { setDefaultVolume } = require('../../erela-features/track-start');

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
.setName('defaultvolume')
.setDescription('To set the default volume of the player!')
.addIntegerOption(option => {
  return option
  .setName('volume')
  .setDescription('The amount of volume (1 - 100%)')
  .setRequired(true)
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  djOnly: true,
  permissions: ['ADMINISTRATOR'],
  callback: async ({ interaction, client, manager }) => {
    await interaction.deferReply({
      ephemeral: true,
    });
    const { guild } = interaction;

    const volume = interaction.options.getInteger('volume');

    if (volume < 1 || volume > 100) {
      return interaction.reply({
        content: `The maximum volume is **100%** and the minimum volume is **1%**!`,
        ephemeral: true,
      })
    }

    await setDefaultVolume(guild, volume);

    await interaction.editReply({
      content: `The default volume for this server is now **${volume}%**!`,
    })
  },
};

module.exports = commandBase;