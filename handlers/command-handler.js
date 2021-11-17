// This command handler is also capable of per-server prefix.

// Importing all the needs
const Discord = require('discord.js');
const validPermissions = require('../utils/permissions');
const guildPrefix = {} // To store all of the servers prefix here
const globalPrefix = process.env.PREFIX; // The default prefix of the bot
const perServerPrefixSchema = require('../schemas/per-server-prefix'); // Importing the prefix database for per-server prefix
const allCommands = {} // This is a place where all commands are stored
let recentlyRan = [] // This array stores all of the commands that ran recently for the cooldown.
const { Manager } = require('erela.js') // Importing the ErelaJS Music Manager

/**
 * This function validates the permissions included in the command so there are no invalid permissions.
 * @param {Discord.PermissionString[]} permissions 
 */
function validatePermissions(permissions) { 
  for (const permission of permissions) {
    if (!validPermissions.includes(permission)) {
      throw new Error(`Unknown permission node: ${permission}`);
    }
  }
};

// Declaring the type for the command options
/**
 * @typedef CommandOptions
 * @property {string|string[]} commands - The name of the command or an array of aliases of that command
 * @property {string} [expectedArgs] - The arguments required for the command
 * @property {number} [minArgs] - The minimum number of arguments
 * @property {number} [maxArgs] - The maximum number of arguments
 * @property {number} [cooldown] - The seconds for the cooldown of the command
 * @property {Discord.PermissionString[]} [permissions] - Permissions required to run the command
 * @property {Discord.PermissionString[]} [clientPermissions] - Permissions that the client is needed to run the command
 * @property {(message: Discord.Message, args: string[], text: string, client: Discord.Client) => any} callback - The function to execute the command whenever the command is triggered
 * @property {boolean} [ownerOnly] - Specifies whether is command is for onwers only
 */

/**
 * This function registers all of the command
 * @param {CommandOptions} commandOptions 
 */
module.exports = commandOptions => {
  // Destructuring all of the elements.
  let {
    commands,
    permissions = [],
    clientPermissions = [],
  } = commandOptions;

  // If the commands is a string then turn it into an array
  if (typeof commands === 'string') {
    commands = [commands];
  };

  // Checking if there are permissions required and validate the permissions
  if (permissions.length) {
    if (typeof permissions === 'string') {
      permissions = [permissions];
    };

    validatePermissions(permissions)
  };

  // Checking if there are client permissions required and validate the permissions
  if (clientPermissions.length) {
    if (typeof clientPermissions === 'string') {
      clientPermissions = [clientPermissions];
    };
    
    validatePermissions(clientPermissions);
  };

  // Storing the commands
  for (const command of commands) {
    allCommands[command] = {
      ...commandOptions,
      permissions,
      clientPermissions,
    }
  }
};

/**
 * 
 * @param {Discord.Client} client 
 * @param {Manager} manager
 */
module.exports.listen = async (client, manager) => {
  client.on('messageCreate', async message => {
    // Destructuring guild, member, content from message
    const { guild, member, content } = message;

    // If the channel is a DM, then this command handler will not execute
    if (message.channel.type === 'DM') return;

    // Getting the prefix for that server or the default prefix
    const prefix = guildPrefix[guild.id] || globalPrefix;

    // Split any spaces using regexp from the content
    const args = content.split(/[ ]+/);

    // Removing the first index which is the command name
    const name = args.shift().toLowerCase();

    // Ensure if the content of the message starts with the prefix
    if (name.startsWith(prefix)) {
      // Finding the command from the allCommands object
      const command = allCommands[name.replace(prefix, '')];

      // If that command does not exist, return so it doesn't execute.
      if (!command) return;

      // Destructuring all of the elements from the object
      const {
        commands,
        expectedArgs = '',
        minArgs = 0,
        maxArgs = null,
        permissions = [],
        clientPermissions = [],
        ownerOnly = false,
        callback,
        cooldown = -1,
      } = command;

      // Checking if the command is for owners only, if yes then it will tell the user
      if (ownerOnly === true) {
        if (!client.owners.includes(member.user.id)) {
          message.reply({
            content: 'This command is for owners only!',
          });
          // Return so it will stop execute the command
          return;
        } else if (client.owners.includes(member.user.id)) {
          if (!client.testServers.includes(guild.id)) {
            message.author.send({
              content: 'If you are the owner, please run this in the test server!',
            })
            message.delete();
            return;
          }
        }
      };

      // Checking if the user has the permissions required to run the command
      for (const permission of permissions) {
        if (!member.permissions.has(permission)) {
          message.reply({
            content: 'You do not have enough permissions to run this command!',
          });
          return;
        }
      };

      for (const permission of clientPermissions) {
        if (!guild.me.permissions.has(permission)) {
          message.reply({
            content: 'I do not have enough permissions to run this command!',
          });
          return;
        }
      };

      // Checking to see if the user had input all of the arguments required by the command
      if (args.length < minArgs || (maxArgs !== null && args.length > maxArgs)) {
        message.reply({
          content: `Incorrect syntax! Please use: \`${prefix}${commands[0]} ${expectedArgs}\``,
        });
        return;
      };

      // Declaring the cooldown string for the recentlyRan array
      let cooldownString = `${guild.id}-${member.id}-${commands[0]}`;

      // Checking if the user has touched the cooldown limit
      if (cooldown > 0 && recentlyRan.includes(cooldownString)) {
        message.reply({
          content: 'Woah woah chill! You can\'t use that command so soon!',
        })
        return
      };

      // Handling the cooldown
      if (cooldown > 0) {
        recentlyRan.push(cooldownString);
        setTimeout(() => {
          recentlyRan = recentlyRan.filter(string => {
            return string !== cooldownString
          });
        }, 1000 * cooldown);
      };

      // Handling the callback function to execute the command whenever it is called
      callback(message, args, args.join(' '), client, prefix, manager);
    }
  })
};

/**
 * This function updates the prefix for that guild
 * @param {Discord.Guild} guild 
 * @param {string} prefix 
 */
module.exports.updatePrefixCache = async (guild, prefix) => {
  // Updating the prefix in the database
  await perServerPrefixSchema.findOneAndUpdate(
    {
      guildId: guild.id,
    },
    {
      guildId: guild.id,
      prefix,
    },
    {
      upsert: true,
    }
  );

  // Updating the prefix in the local memory
  guildPrefix[guild.id] = prefix;
};

/**
 * This function loads all of the server's prefix into the local memory
 * @param {Discord.Client} client 
 */
module.exports.loadPrefix = async client => {
  // Getting all of the servers directly from the Discord API
  const servers = (await client.guilds.fetch());

  // Looping through all of the servers
  for (const guild of servers) {
    // Getting the guild ID
    const guildId = guild[1].id;

    // Fetching the prefix from the database of that server
    const result = await perServerPrefixSchema.findOne({ guildId });
    
    // Storing it in the local memory of the bot
    guildPrefix[guildId] = result ? result.prefix : globalPrefix;
  };

  console.log(`Loading prefix for ${servers.size} servers!`);
}

/**
 * 
 * @param {Discord.Guild} guild 
 */
module.exports.getPrefix = guild => {
  return guildPrefix[guild.id];
}