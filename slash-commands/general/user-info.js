const Discord = require('discord.js');
const DiscordBuilder = require('@discordjs/builders');
const { time } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

/**
* @typedef CallbackObject
* @property {Discord.CommandInteraction} interaction
* @property {Discord.Client} client
*/

/**
* @typedef CommandOptions
* @property {DiscordBuilder.SlashCommandBuilder} data
* @property {boolean} [testOnly]
* @property {boolean} [ownerOnly]
* @property {Discord.PermissionString[]} [permissions]
* @property {Discord.PermissionString[]} [clientPermissions]
* @property {(obj: CallbackObject) => any} callback
*/

const data = new DiscordBuilder.SlashCommandBuilder()
.setName('userinfo')
.setDescription('To display a user\'s info!')
.addUserOption(option => {
  return option
  .setName('user')
  .setDescription('The user that you want the info from!')
  .setRequired(true)
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  callback: async ({ interaction, client }) => {
    await interaction.deferReply();
    const { guild } = interaction;

    let rolesText = '';
    const target = interaction.options.getUser('user');

    const targetMember = guild.members.cache.get(target.id);

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
    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
    .setThumbnail(targetMember.user.displayAvatarURL({ dynamic: true }))
    .setColor("WHITE")
    .setTitle(`${targetMember.user.username}'s info`)
    .addFields([
      {
        name: "User's tag:",
        value: targetMember.user.tag,
        inline: true,
      },
      {
        name: 'User\'s ID:',
        value: targetMember.user.id,
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
        value: time(new Date(targetMember.user.createdTimestamp)) || time(targetMember.user.createdAt),
        inline: true,
      },
      {
        name: 'Joined server at:',
        value: time(new Date(targetMember.joinedTimestamp)) || time(targetMember.joinedAt),
        inline: true,
      },
      {
        name: 'Roles:',
        value: rolesText,
      }
    ]);

    await wait(1000);

    await interaction.editReply({
      embeds: [embed],
    });

    rolesText = '';
  },
};

module.exports = commandBase;