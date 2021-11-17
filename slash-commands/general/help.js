const Discord = require('discord.js');
const DiscordBuilder = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
const wait = require('util').promisify(setTimeout);
const token = process.env.TOKEN;
const { REST } = require("@discordjs/rest");
const { Routes } = require('discord-api-types/v9');

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

const readGroups = async dir => {
  const groupsArr = [];

  const groups = fs.readdirSync(path.join(__dirname, dir));
  for (const group of groups) {
    const stat = fs.lstatSync(path.join(__dirname, dir, group));
    if (stat.isDirectory()) {
      if (!groupsArr.includes(group)) {
        groupsArr.push(group)
      }
    }
  };

  return groupsArr;
};

const readCommandsInGroup = async dir => {
  const commands = {};

  const files = fs.readdirSync(path.join(__dirname, `../../slash-commands/${dir}`));
  for (const file of files) {
    const command = require(path.join(__dirname, `../../slash-commands/${dir}/${file}`));
    commands[file] = command.data.toJSON();
  };

  return commands;
}

const data = new DiscordBuilder.SlashCommandBuilder()
.setName('help')
.setDescription('Displays basic info about Music\'s Taste!')
.addStringOption(option => {
  return option
  .setName('command')
  .setDescription('The command.')
  .setRequired(false)
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  callback: async ({ interaction, client }) => {
    const groups = await readGroups('../../slash-commands');

    const cmd = interaction.options.getString('command');

    if (cmd) {
      const commands = [];
      const commandFiles = [];
      const readFiles = fs.readdirSync(path.join(__dirname, `../../slash-commands`));
      for (const file of readFiles) {
        if (!file.endsWith('.js')) {
          const readMoreFiles = fs.readdirSync(path.join(__dirname, `../../slash-commands`, file));
          for (const commandFile of readMoreFiles) {
            const command = require(`../../slash-commands/${file}/${commandFile}`);
            commands.push(command.data.toJSON());
          }
        }
      }

      for (const command of commands) {
        commandFiles.push(command);
      };

      const validCommand = commandFiles.filter(element => {
        return element.name === cmd.toLowerCase();
      });

      if (!validCommand.length) {
        return await interaction.reply({
          content: `The command: \`${cmd.toLowerCase()}\` is not valid!`,
          ephemeral: true,
        });
      };

      const embed = new Discord.MessageEmbed()
      .setAuthor('Support server', client.user.displayAvatarURL(), 'https://discord.gg/6JBMEbyb3c')
      .setColor("WHITE")
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setTitle(`/${validCommand[0].name.toLowerCase()}`)
      .addFields(
        {
          name: 'Description:',
          value: validCommand[0].description,
        }
      )

      return await interaction.reply({
        embeds: [embed],
      })
    };

    const helpEmbed = new Discord.MessageEmbed()
    .setAuthor('Support server', client.user.displayAvatarURL({ dynamic: true }), 'https://discord.gg/6JBMEbyb3c')
    .setColor("WHITE")
    .setTitle('Help!')
    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
    .setDescription(`**${interaction.guild.name}** is using slash commands! Use \`/help <command>\` to show the details of that command!`)
    .setFooter(`${client.user.username} was made by IcyTea#1760`, client.user.displayAvatarURL({ dynamic: true }))

    for (const group of groups) {
      const groupName = DiscordBuilder.underscore(group.toUpperCase())
      const commandsName = [];

      const commands = await readCommandsInGroup(group.toLowerCase());

      for (const key in commands) {
        let commandName = commands[key].name;

        if (!commandsName.includes(commandName)) {
          commandsName.push(`\`${commandName}\``);
        }
      };

      (commandsName.length ? helpEmbed.addField(groupName, commandsName.join(', ')) : '');
    };

    await interaction.reply({
      embeds: [helpEmbed],
    });
  },
};

module.exports = commandBase;