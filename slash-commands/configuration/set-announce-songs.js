const Discord = require('discord.js');
const embedConstructor = require('../../utils/embed-interaction');
const DiscordBuilder = require('@discordjs/builders');
const { Manager } = require('erela.js');
const { returnAnnounceSongs, setAnnounceSongs } = require('../../erela-features/track-start');

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
.setName('announcesongs')
.setDescription('To toggle announce songs when playing!')
.addStringOption(option => {
  return option.setName('choice')
  .setDescription('True or False')
  .addChoice('True', 'true')
  .addChoice('False', 'false')
  .setRequired(false)
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  djOnly: true,
  permissions: ['ADMINISTRATOR'],
  callback: async ({ interaction, client, manager }) => {
    await interaction.deferReply({
      ephemeral: true,
    });
    const { guild, member: intMember } = interaction;

    const member = guild.members.cache.get(intMember.id);

    const choice = interaction.options.getString('choice');

    if (!choice) {
      let option = await returnAnnounceSongs(guild.id);

      if (option === true) {
        option = 'The Announce Songs system is **Enabled**!';
      } else if (option === false) {
        option = 'The Announce Songs system is **Disabled**!';
      } else {
        option = 'The Announce Songs system is not set in the server!'
      }

      await interaction.editReply({
        content: option,
      });
      
      return;
    };

    let option = true;

    if (choice === 'true') {
      option = true;
    } else if (choice === 'false') {
      option = false;
    };

    await setAnnounceSongs(guild.id, option);

    if (option === true) {
      await interaction.editReply({
        content: `The Announce Songs system has been **Enabled**!`,
      });
      return;
    } else if (option === false) {
      await interaction.editReply({
        content: `The Announce Songs system has been **Disabled**!`,
      });
      return;
    }
  },
};

module.exports = commandBase;