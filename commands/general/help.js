const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getPrefix } = require('../../handlers/command-handler');

const readGroups = async dir => {
  const groupsArr = [];

  const groups = fs.readdirSync(path.join(__dirname, dir));
  for (const group of groups) {
    const stat = fs.lstatSync(path.join(__dirname, dir, group));
    if (stat.isDirectory()) {
      if (!groupsArr.includes(group)) {
        groupsArr.push(group);
      };
    };
  }

  return groupsArr;
};

const readCommandsInGroup = async dir => {
  const commands = {};

  const files = fs.readdirSync(path.join(__dirname, `../../commands/${dir}`));
  for (const file of files) {
    const command = require(path.join(__dirname, `../../commands/${dir}/${file}`));
    commands[file] = command;
  };

  return commands;
};

module.exports = {
  commands: 'help',
  minArgs: 0,
  maxArgs: 1,
  expectedArgs: '[command]',
  callback: async (message, args, text, client) => {
    const groups = await readGroups('../../commands');
    const prefix = await getPrefix(message.guild).then(prefix => {
      return prefix;
    });

    if (args.length) {
      const commands = [];
      const commandFiles = [];
      const readFiles = fs.readdirSync(path.join(__dirname, '../../commands'));
      for (const file of readFiles) {
        if (!file.endsWith('.js')) {
          const readMoreFiles = fs.readdirSync(path.join(__dirname, '../../commands', file));
          for (const commandFile of readMoreFiles) {
            const command = require(`../../commands/${file}/${commandFile}`);
            commands.push(command);
          }
        }
      }

      for (const command of commands) {
        if (typeof command.commands === 'string') {
          commandFiles.push({
            name: command.commands,
            aliases: ['None'],
            minArgs: command.minArgs,
            maxArgs: command.maxArgs,
            expectedArgs: command.expectedArgs,
            permissions: typeof command.permissions === 'string' ? [command.permissions] : command.permissions,
            ownerOnly: command.ownerOnly ? 'True' : 'False',
          })
        } else {
          commandFiles.push(
            {
              name: command.commands[0],
              aliases: command.commands.slice(1),
              minArgs: command.minArgs,
              maxArgs: command.maxArgs,
              expectedArgs: command.expectedArgs,
              permissions: typeof command.permissions === 'string' ? [command.permissions] : command.permissions,
              ownerOnly: command.ownerOnly ? "True" : 'False',
            }
          )
        }
      }
      
      const validCommand = commandFiles.filter(element => {
        return element.name === text.toLowerCase();
      });

      if (!validCommand.length) {
        message.reply(`The command: \`${text.toLowerCase()}\` is not valid!`);
        return;
      };

      const embed = new Discord.MessageEmbed()
      .setAuthor('Support server', client.user.displayAvatarURL(), 'https://discord.gg/6JBMEbyb3c')
      .setColor('WHITE')
      .setThumbnail(client.user.displayAvatarURL())
      .setTitle(`Command: ${validCommand[0].name.toUpperCase()}`)
      .addFields(
        {
          name: 'Aliases:',
          value: validCommand[0].aliases.join(', '),
        },
        {
          name: 'Minimun arguments:',
          value: validCommand[0].minArgs ? validCommand[0].minArgs.toString() : 'None',
        },
        {
          name: 'Maximum arguments:',
          value: validCommand[0].maxArgs ? validCommand[0].maxArgs.toString() : 'None',
        },
        {
          name: 'Expected arguments:',
          value: validCommand[0].expectedArgs || 'None',
        },
        {
          name: 'Permissions required:',
          value: validCommand[0].permissions ? validCommand[0].permissions.join(', ') : 'None',
        },
        {
          name: 'Owner only?',
          value: validCommand[0].ownerOnly,
        }
      )
      .setFooter(`<> = required, [] = optional`, client.user.displayAvatarURL())

      message.reply({ embeds: [embed] });

      return;
    };

    const row = new Discord.MessageActionRow()
    .addComponents(
      new Discord.MessageButton()
      .setLabel('IcyBot Official Website!')
      .setStyle('LINK')
      .setURL('http://192.168.0.102:3003/main')
    )

    const helpEmbed = new Discord.MessageEmbed()
    .setAuthor('Support Server', client.user.displayAvatarURL(), 'https://discord.gg/6JBMEbyb3c')
    .setColor('WHITE')
    .setTitle('Help Menu!')
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription(`${message.guild.name}'s prefix is: \`${prefix}\`\nUse \`${prefix}help <command>\` to show the details of the command!`)
    .setFooter(`${client.user.username} was made by IcyTea#1760`, client.user.displayAvatarURL())

    for (const group of groups) {
      const groupName = `__${group.toUpperCase()}__`;
      const commandsName = [];

      const commands = await readCommandsInGroup(group.toLowerCase());
      for (const key in commands) {
        let commandName = commands[key].commands;

        if (typeof commandName === 'string') {
          commandName = [commandName];
        };

        if (!commandsName.includes(commandName[0])) {
          commandsName.push(`\`${commandName[0]}\``);
        }
      }

      helpEmbed.addField(groupName, commandsName.join(', '));
    };

    message.reply({ embeds: [helpEmbed], components: [row] });
  }
}