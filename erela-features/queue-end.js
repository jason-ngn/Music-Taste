const discord = require('discord.js');
const erela = require('erela.js');
const { resetTrackCache } = require('./track-start');

/**
 * 
 * @param {discord.Client} client 
 * @param {erela.Manager} manager 
 */
module.exports = async (client, manager) => {
  manager.on('queueEnd', async player => {
    const channel = client.channels.cache.get(player.textChannel);
    await resetTrackCache(player.guild);

    channel.send(`Nothing left to play, I'm leaving!`).then(() => {
      player.destroy();
    })
  })
}