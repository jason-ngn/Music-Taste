const validPermissions = require('../utils/permissions');
const guildPrefix = {};
const globalPrefix = process.env.PREFIX;

function validatePermissions(permissions) {
  for (const permission of permissions) {
    if (!validPermissions.includes(permission)) {
      throw new Error(`Unknown permission node: ${permission}`);
    }
  }
}

module.exports = async (client, commandOptions) => {
  let {
    commands,
    expectedArgs = '',
    permissionError = 'You do not have permission to run this command',
    minArgs = 0,
    maxArgs = null,
    cooldown = -1,
    permissions = [],
    callback,
  } = commandOptions;

  if (typeof commands === 'string') {
    commands = [commands];
  };

  if (permissions.length) {
    if (typeof permissions === 'string') {
      permissions = [permissions];
    }

    validatePermissions(permissions);
  }

  client.on('messageCreate', async message => {
    const { member, content, guild, channel } = message;

    const prefix = guildPrefix[guild.id] || globalPrefix;

    for (const alias of commands) {
      const command = `${prefix}${alias.toLowerCase()}`;

      if (content.toLowerCase().startsWith(`${command} `) || content.toLowerCase() === command) {
        for (const permission of permissions) {
          if (!member.permissions.has(permission)) {
            message.reply(permissionError);
            return;
          }
        };

        const args = content.split(/[ ]+/);

        args.shift();

        if (args.length < minArgs || (maxArgs !== null && args.length > maxArgs)) {
          message.reply(`Incorrect syntax! Please use: \`${prefix}${alias} ${expectedArgs}\``);
          return;
        };

        callback(message, args, args.join(' '), client);

        return;
      };
    };
  });
};

module.exports.updatePrefixCache = (guild, prefix) => {
  // do mongo stuff

  guildPrefix[guild.id] = prefix;
};

module.exports.loadPrefix = async client => {
  // do mongo stuff

  for (const guild of client.guilds.cache) {
    const guildId = guild[1].id;

    guildPrefix[guildId] = globalPrefix;
  };

  console.log(`Loading prefix for ${client.guilds.cache.size} server(s)!`);
}
