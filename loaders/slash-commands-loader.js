const { REST } = require("@discordjs/rest");
const { Routes } = require('discord-api-types/v9');
const Discord = require('discord.js');
const { Manager } = require("erela.js");
const fs = require('fs');
const path = require('path');
const slashCommandBase = require('../handlers/slash-command-handler');
const token = process.env.TOKEN;
const testServer = '773477649174626344';
const clientId = '815845605876301854';

/**
 * 
 * @param {Discord.Client} client 
 * @param {Manager} manager
 */
module.exports = async (client, manager) => {
  const testOnlyArray = [];
  const globalArray = [];

  const rest = new REST({ version: '9' }).setToken(token);

  const readCommands = async dir => {
    const files = fs.readdirSync(path.join(__dirname, dir));
    for (const file of files) {
      const stat = fs.lstatSync(path.join(__dirname, dir, file));
      if (stat.isDirectory()) {
        readCommands(path.join(dir, file));
      } else {
        const command = require(path.join(__dirname, dir, file));
        if (command.testOnly && command.testOnly === true) {
          testOnlyArray.push(command.data.toJSON());
          console.log(`Enabling slash command: ${command.data.name} [Test command]`)
        } else {
          globalArray.push(command.data.toJSON());
          console.log(`Enabling slash command: ${command.data.name}`);
        }
        slashCommandBase(command);
      }
    }
  };

  readCommands('../slash-commands');

  async function registerGuildCommands() {
    try {
      console.log('Started refreshing guild application (/) commands.');

      await rest.put(
        Routes.applicationGuildCommands(clientId, testServer),
        {
          body: testOnlyArray,
        }
      );

      console.log(`Successfully reloaded guild application (/) commands!`);
    } catch (err) {
      throw err;
    }
  };

  async function registerGlobalCommands() {
    try {
      console.log('Started refreshing global application (/) commands.');

      await rest.put(
        Routes.applicationCommands(clientId),
        {
          body: globalArray,
        }
      );

      console.log('Successfully reloaded global application (/) commands!');
    } catch (err) {
      throw err;
    }
  };

  if (testOnlyArray.length > 0) await registerGuildCommands();
  if (globalArray.length > 0) await registerGlobalCommands();

  slashCommandBase.listen(client, manager);
}