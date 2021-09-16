const Discord = require('discord.js');

module.exports = {
  commands: 'serverlist',
  ownerOnly: true,
  callback: async (message, args, text, client, languageHandler) => {
    const { guild } = message;

    const embed = new Discord.MessageEmbed()
    .setTitle('List of servers')
    .setDescription(`Number of servers: ${client.guilds.cache.size.toLocaleString()}`);
    
    for (const guild of client.guilds.cache) {
      embed.addFields(
        {
          name: guild[1].name,
          value: `ID: ${guild[1].id}\nMember Count: ${guild[1].memberCount}\nOwner: <@${guild[1].ownerId}>`,
        }
      );
    }

    const language = languageHandler(guild, 'Hello').then(res => {
      return res;
    })

    console.log(language);

    message.reply({ embeds: [embed] });
  }
}