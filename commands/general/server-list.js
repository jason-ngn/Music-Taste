const Discord = require('discord.js');
const embedConstructor = require('../../utils/embed.js');
const { getPrefix } = require('../../handlers/command-handler');

module.exports = {
  commands: 'serverlist',
  description: 'To show the list of servers!',
  ownerOnly: true,
  /**
   * @param {Discord.Message} message
   * @param {string[]} args
   * @param {string} text
   * @param {Discord.Client} client
   */
  callback: async (message, args, text, client) => {
    const { guild } = message;

    const embed = new Discord.MessageEmbed()
    .setColor('WHITE')
    .setTitle(`List of servers!`)
    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
    .setDescription(`Number of servers: ${client.guilds.cache.size.toLocaleString()}`)

    for (const guild of client.guilds.cache) {
      const prefix = await getPrefix(guild[1]);

      embed.addField(guild[1].name, `ID: ${guild[1].id}\nMember count: ${guild[1].memberCount}\nOwner: <@${guild[1].ownerId}>\nPrefix: \`${prefix}\``);
    };

    message.reply({
      embeds: [embed],
    })
  },
}