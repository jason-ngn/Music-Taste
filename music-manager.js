const Erela = require('erela.js');
const Discord = require('discord.js');

/**
 * 
 * @param {Discord.Client} client 
 */
module.exports = async (client) => {
  const manager = new Erela.Manager({
    nodes: [
      {
        host: 'lava.link',
        port: 80,
        password: 'anythingasapassword'
      }
    ],
    send(id, payload) {
      const guild = client.guilds.cache.get(id);
      if (guild) guild.shard.send(payload);
    }
  })

  manager.init(client.user.id);

  return manager;
};