const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  commands: ['uptime', 'up'],
  /**
   * 
   * @param {Discord.Message} message 
   * @param {string[]} args 
   * @param {string} text 
   * @param {Discord.Client} client 
   */
  callback: async (message, args, text, client) => {
    const uptime = moment.duration(client.uptime).format('D [days] H [hrs] m [mins] s [secs]');

    message.reply({
      content: `**My uptime is:** \`${uptime}\``,
    });
  }
}