const validPermissions = require('../utils/permissions');
const guildPrefix = {};
const globalPrefix = process.env.PREFIX;
const perServerPrefixSchema = require('../schemas/per-server-prefix');

function validatePermissions(permissions) {
  for (const permission of permissions) {
    if (!validPermissions.includes(permission)) {
      throw new Error(`Unknown permission node: ${permission}`);
    }
  }
}

let recentlyRan = [];

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
    ownerOnly = false,
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
        if (ownerOnly === true) {
          if (!client.owners.includes(member.user.id)) {
            message.reply(`This command is for owners only!`);
            return;
          };
        };

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

        let cooldownString = `${guild.id}-${member.id}-${commands[0]}`;

        if (cooldown > 0 && recentlyRan.includes(cooldownString)) {
          message.reply(`Woah woah chill! You can't use that command so soon!`);
          return;
        };

        if (cooldown > 0) {
          recentlyRan.push(cooldownString);
          setTimeout(() => {
            recentlyRan = recentlyRan.filter(string => {
              return string !== cooldownString;
            });
          }, 1000 * cooldown);
        }

        callback(message, args, args.join(' '), client);

        return;
      };
    };
  });
};

module.exports.updatePrefixCache = async (guild, prefix) => {
  await perServerPrefixSchema.findOneAndUpdate({
    guildId: guild.id,
  }, {
    guildId: guild.id,
    prefix,
  }, {
    upsert: true,
  });

  guildPrefix[guild.id] = prefix;
};

module.exports.loadPrefix = async client => {
  for (const guild of client.guilds.cache) {
    const guildId = guild[1].id;

    const result = await perServerPrefixSchema.findOne({ guildId });
    guildPrefix[guildId] = result ? result.prefix : globalPrefix;
  };

  console.log(`Loading prefix for ${client.guilds.cache.size} server(s)!`);
}
