const { Client } = require('discord.js');
const { Manager } = require('erela.js');
const {
  setDefaultVolume,
  setAnnounceSongs, 
  updateTrackCache 
} = require('../erela-features/track-start');
const { 
  updatePrefixCache 
} = require('../handlers/command-handler');

/**
 * 
 * @param {Client} client 
 * @param {Manager} manager 
 */
module.exports = (client, manager) => {
  client.on('guildCreate', async guild => {
    await setDefaultVolume(guild, 100);
    await setAnnounceSongs(guild, true);
    await updateTrackCache(guild);
    await updatePrefixCache(guild, process.env.PREFIX);
  });
}