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
* @property {boolean} [djOnly]
* @property {Discord.PermissionString[]} [permissions]
* @property {Discord.PermissionString[]} [clientPermissions]
* @property {(obj: CallbackObject) => any} callback
*/

const data = new DiscordBuilder.SlashCommandBuilder()
.setName('join')
.setDescription('To join the voice channel you are currently in or a specified channel!')
.addChannelOption(option => {
  return option
  .setName('channel')
  .setDescription('The voice channel you want me to be in!')
  .setRequired(false)
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  callback: async ({ interaction, client, manager }) => {
    const { guild, member: intMember } = interaction;

    const member = guild.members.cache.get(intMember.id);

    const voiceChannel = member.voice.channel;

    const targetChannel = interaction.options.getChannel('channel');

    if (!targetChannel) {
      if (!voiceChannel) {
        return await interaction.reply({
          content: "Please join a voice channel!",
          ephemeral: true,
        })
      };

      let player = manager.players.get(guild.id);

      if (player && player.state === 'CONNECTED') {
        return await interaction.reply({
          content: `The bot has already joined <#${player.voiceChannel}>!`,
          ephemeral: true,
        })
      } else {
        player = await manager.create({
          guild: guild.id,
          textChannel: interaction.channel.id,
          voiceChannel: voiceChannel.id,
        });
      };

      await player.connect();

      await interaction.reply({
        content: `Joined ${voiceChannel} successfully!`,
        ephemeral: true,
      });

      return;
    };

    if (targetChannel.type !== 'GUILD_VOICE') {
      return await interaction.reply({
        content: "Please tag a voice channel!",
        ephemeral: true,
      })
    };

    let player = manager.players.get(guild.id);

    if (player && player.state === 'CONNECTED') {
      return await interaction.reply({
        content: `The bot has already joined <#${player.voiceChannel}>!`,
        ephemeral: true,
      })
    } else {
      player = await manager.create({
        guild: guild.id,
        textChannel: interaction.channel.id,
        voiceChannel: targetChannel.id,
      })
    };

    await player.connect();

    await interaction.reply({
      content: `Joined ${targetChannel} successfully!`,
      ephemeral: true,
    });
  },
};

module.exports = commandBase;