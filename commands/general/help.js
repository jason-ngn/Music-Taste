const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  commands: 'help',
  minArgs: 0,
  maxArgs: 1,
  expectedArgs: '[command]',
  callback: async (message, args, text, client) => {
    const helpEmbed = new Discord.MessageEmbed()
    .setTitle('help')

    const row = new Discord.MessageActionRow(
      new Discord.MessageButton()
      .setLabel('General')
      .setCustomId('general')
      .setStyle('PRIMARY'),
    )

    message.channel.send({ embeds: [helpEmbed], components: [row] });
  }
}