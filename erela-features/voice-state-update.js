const Discord = require('discord.js');
const Erela = require('erela.js');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Erela.Manager} manager 
 */
module.exports = async (client, manager) => {
  client.on('raw', d => manager.updateVoiceState(d));
}