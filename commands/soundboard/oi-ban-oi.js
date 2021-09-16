const Discord = require('discord.js');
const DiscordVoice = require('@discordjs/voice');
const path = require('path');

module.exports = {
  commands: 'oibanoi',
  /**
   * 
   * @param {Discord.Message} message 
   * @param {string[]} args 
   * @param {string} text 
   * @param {Discord.Client} client 
   */
  async callback(message, args, text, client) {
    const { guild } = message;

    const { channel } = message.member.voice;

    if (!channel) {
      return message.channel.send('Please join a voice channel to use the soundboard\'s commands!');
    };

    message.react('▶️').then(() => {
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
      });
    })
  }
}