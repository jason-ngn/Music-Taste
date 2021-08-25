const Discord = require('discord.js');

module.exports = {
  commands: 'userinfo',
  minArgs: 0,
  maxArgs: 1,
  expectedArgs: '[user]',
  callback: async (message, args, text, client) => {
    const { guild } = message;

    let id = '';
    let rolesText = '';

    if (text) {
      let target = text;

      if (target.includes('<@!')) {
        target = target.replace('<@!', '').replace('>', '');

        id = target;
      }
    } else {
      id = message.author.id;
    };

    const targetMember = guild.members.cache.get(id);

    const roles = targetMember.roles.cache.filter(role => {
      return role.name !== '@everyone';
    });

    if (roles.size !== 0) {
      roles.forEach(role => {
        rolesText += `${role}\n`;
      });
    } else {
      rolesText += 'None';
    };

    const embed = new Discord.MessageEmbed()
    .setAuthor(message.author.username, message.author.displayAvatarURL())
    .setThumbnail(targetMember.user.displayAvatarURL())
    .setColor('WHITE')
    .setTitle(`${targetMember.user.username}'s info`)
    .addFields(
      {
        name: 'User\'s tag:',
        value: targetMember.user.tag,
        inline: true,
      },
      {
        name: `User's ID:`,
        value: targetMember.id,
        inline: true,
      },
      {
        name: `Is ${targetMember.user.username} a bot?`,
        value: targetMember.user.bot ? `${targetMember.user.username} is a bot!` : `${targetMember.user.username} is not a bot!`,
        inline: true,
      },
      {
        name: 'Nickname:',
        value: targetMember.nickname ? targetMember.nickname : 'None',
        inline: true,
      },
      {
        name: 'Account created at:',
        value: new Date(targetMember.user.createdTimestamp).toLocaleString() || targetMember.user.createdAt.toLocaleString(),
        inline: true,
      },
      {
        name: 'Joined server at:',
        value: new Date(targetMember.user.joinedTimestamp).toLocaleString() || targetMember.joinedAt.toLocaleString(),
        inline: true,
      },
      {
        name: 'Roles:',
        value: rolesText,
      }
    )

    message.reply({ embeds: [embed] });
    rolesText = '';
  }
}