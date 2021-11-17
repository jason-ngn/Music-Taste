const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const commandHandler = require('../handlers/command-handler');
const { Manager } = require('erela.js');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Manager} manager
 */
module.exports = async (client, manager) => {
  const commands = [];

  // This function reads all of the commands in the "commands" folder
  const readCommands = async dir => {
    // Readding all of the commands
    const files = fs.readdirSync(path.join(__dirname, dir));
    for (const file of files) {
      // Checking to see if the file is an directory
      const stat = fs.lstatSync(path.join(__dirname, dir, file));
      if (stat.isDirectory()) {
        // If the file is a directory
        console.log(`Registering group: ${file}`);
        readCommands(path.join(dir, file));
      } else {
        // If the file is not a directory, then it is a command.
        const command = require(path.join(__dirname, dir, file));

        // Pushing the command into the array
        commands.push(command);
        console.log(`Enabling command: ${file}`);
        commandHandler(command);
      }
    }
  };

  readCommands('../commands');

  commandHandler.listen(client, manager);

  return commands;
};