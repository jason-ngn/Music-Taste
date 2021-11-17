const Discord = require('discord.js');
const DiscordBuilder = require('@discordjs/builders');
const DiscordVoice = require('@discordjs/voice');
const path = require('path');
const yesId = 'yes';
const noId = 'no';

/**
* @typedef CallbackObject
* @property {Discord.CommandInteraction} interaction
* @property {Discord.Client} client
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
.setName('propose')
.setDescription('To propose and marry someone through Discord!')
.addUserOption(option => {
  return option
  .setName('user')
  .setDescription('The user you would like to marry!')
  .setRequired(true)
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  callback: async ({ interaction, client }) => {
    const { guild, member } = interaction;
    const targetUser = interaction.options.getUser('user');

    if (targetUser.bot) return interaction.reply({
      content: 'Hey you can\'t marry a bot...'
    })

    const targetMember = guild.members.cache.get(targetUser.id);

    if (!member.voice || !targetMember.voice.channel) {
      return interaction.reply({
        content: `<@${member.user.id}>, <@${targetMember.user.id}>. Both of you please join a voice channel for a surprise from the owner of the bot!`
      })
    };

    const yesButton = new Discord.MessageButton()
    .setCustomId(yesId)
    .setLabel('YES!!!!!!!')
    .setStyle('SUCCESS')
    
    const noButton = new Discord.MessageButton()
    .setCustomId(noId)
    .setLabel('No :(')
    .setStyle('DANGER')

    const proposeEmbed = new Discord.MessageEmbed()
    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
    .setColor("WHITE")
    .setTitle('Will you marry me?')
    .setDescription(`**${targetMember.user.username}**, **${member.user.username}** has always wanted to marry you! Will you accept is proposal?`)

    await interaction.reply({
      content: `<@${targetMember.user.id}>,`,
      embeds: [proposeEmbed],
      components: [new Discord.MessageActionRow({
        components: [yesButton, noButton]
      })]
    });

    const player = DiscordVoice.createAudioPlayer();
    const resource = DiscordVoice.createAudioResource(path.join(__dirname, '../../soundboards/wedding-music.mp3'));

    const connection = DiscordVoice.joinVoiceChannel({
      guildId: guild.id,
      channelId: targetMember.voice.channel.id,
      adapterCreator: guild.voiceAdapterCreator,
    });
    
    player.play(resource);
    connection.subscribe(player);

    player.on(DiscordVoice.AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.user.id === targetMember.user.id,
      max: 1,
    });

    collector.on('end', async collected => {
      await connection.destroy();

      const button = collected.first();

      if (button.customId === yesId) {
        const yesEmbed = new Discord.MessageEmbed()
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
        .setColor("WHITE")
        .setTitle('CONGRATULATIONS!!!!')
        .setDescription(`**${targetUser.username}** and **${member.user.username}** is now a couple!!!!`)

        return await button.update({
          embeds: [yesEmbed],
          components: [],
          content: `<@${member.user.id}>, <@${targetMember.user.id}>,`
        })
      } else {
        const noEmbed = new Discord.MessageEmbed()
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
        .setColor("WHITE")
        .setTitle("Oh that's sad :(")
        .setDescription(`That's so sad my owner may cry :(`)

        return await button.update({
          content: `<@${member.user.id}>, <@${targetMember.user.id}>,`,
          embeds: [noEmbed],
          components: [],
        })
      }
    })
  },
};

module.exports = commandBase;