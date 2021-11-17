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
.setName('bassboost')
.setDescription('To change the bassboost level of a song!')
.addStringOption(option => {
  return option
  .setName('level')
  .setDescription(`The bassboost level (-0.25 to 1.00)`)
  .setRequired(false)
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  callback: async ({ interaction, client, manager }) => {
    const { guild, member: intMember } = interaction;

    const member = (await guild.members.fetch()).get(intMember.id);

    let bassboost = interaction.options.getString('level');
    bassboost = parseFloat(bassboost);

    const { channel } = member.voice;

    if (!channel) return interaction.reply({
      content: 'Please join a voice channel!',
      ephemeral: true,
    });

    const player = manager.players.get(guild.id);

    if (!player) return interaction.reply({
      content: 'There is no player for this server!',
      ephemeral: true,
    });

    if (channel.id !== player.voiceChannel) return interaction.reply({
      content: 'You are not in the same voice channel as the bot!',
      ephemeral: true,
    });

    if (!player.playing && !player.paused) {
      return interaction.reply({
        content: 'There is no song playing!',
        ephemeral: true,
      })
    };

    if (bassboost < -0.25 || bassboost > 1) {
      return interaction.reply({
        content: `Bassboost level has to be lower than -0.25 or higher than 1.00!`,
        ephemeral: true
      })
    };

    const bands = new Array(3).fill(null).map((_, i) => ({
      band: i,
      gain: bassboost,
    }));

    await player.setEQ(...bands);

    interaction.reply({
      content: `Bassboost level set to: \`${bassboost.toLocaleString()} / 1.00\``,
    });
  },
};

module.exports = commandBase;