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
.setName('remove')
.setDescription('To remove a song from the queue!')
.addIntegerOption(option => {
  return option
  .setName('queue-number')
  .setDescription('The number of the song in the queue!')
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

    const { channel } = member.voice;

    if (!channel) {
      return interaction.reply({
        ephemeral: true,
        content: 'Please join a voice channel!'
      })
    };

    const player = manager.players.get(guild.id);

    if (!player) {
      return interaction.reply({
        ephemeral: true,
        content: 'There is no player for this server!'
      })
    };

    if (channel.id !== player.voiceChannel) {
      return interaction.reply({
        content: 'You are not in the same voice channel as the bot!',
        ephemeral: true,
      })
    };

    const number = interaction.options.getInteger('queue-number');

    const index = number - 1;

    const trackDeleted = player.queue.splice(index, 1)[0];

    const e = embedConstructor(interaction, {
      title: 'Track deleted!',
      description: `[${trackDeleted.title}](${trackDeleted.uri}) has been deleted from the queue!`,
    });

    interaction.reply({
      embeds: [e],
    })
  },
};

module.exports = commandBase;