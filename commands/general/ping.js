const { MessageEmbed } = require("discord.js");

module.exports = {
  commands: 'ping',
  callback: async (message, args, text, client) => {
    message.channel.send('Pinging').then(async msg => {
      await msg.edit('Pinging.');
      await msg.edit('Pinging..');
      await msg.edit('Pinging...');

      const ping = msg.createdTimestamp - message.createdTimestamp;

      const pingEmbed = new MessageEmbed()
      .setTitle('Pong!')
      .setColor('WHITE')
      .addFields(
        {
          name: 'Bot\'s latency:',
          value: `${ping}ms`,
        },
        {
          name: 'API latency:',
          value: `${client.ws.ping}ms`,
        }
      )
      await msg.delete();
      message.channel.send({ embeds: [pingEmbed] });
    })
  },
}