const Discord = require('discord.js');
const embedConstructor = require('../../utils/embed-interaction');
const DiscordBuilder = require('@discordjs/builders');
const { Manager } = require('erela.js');
const DiscordVoice = require('@discordjs/voice');
const path = require('path');

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
.setName('oibanoi')
.setDescription('This is a soundboard command!')

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  callback: async ({ interaction, client, manager }) => {
    const { guild, member: intMember } = interaction;

    const member = guild.members.cache.get(intMember.id);

    const { channel } = member.voice;

    if (!channel) {
      return await interaction.reply({
        content: 'Please join a voice channel!',
        ephemeral: true,
      })
    };

    await interaction.reply({
      content: 'Successfully played in the voice channel!',
      ephemeral: true,
    }).then(() => {
      const player = DiscordVoice.createAudioPlayer();
      const resource = DiscordVoice.createAudioResource(path.join(__dirname, '../../soundboards/oi-ban-oi.mp3'));

      const connection = DiscordVoice.joinVoiceChannel({
        guildId: guild.id,
        channelId: channel.id,
        adapterCreator: guild.voiceAdapterCreator,
      });

      player.play(resource);
      connection.subscribe(player);

      player.on(DiscordVoice.AudioPlayerStatus.Idle, () => {
        connection.destroy();
      })
    })
  },
};

module.exports = commandBase;