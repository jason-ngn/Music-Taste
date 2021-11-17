const Discord = require('discord.js');
const DiscordBuilder = require('@discordjs/builders');
const allCommands = {};
const validPermissions = require('../utils/permissions');
const { Manager } = require('erela.js');
const djRoleSchema = require('../schemas/dj-role-schema');
const djRolesCache = {};

/**
 * @typedef CallbackObject
 * @property {Discord.CommandInteraction} interaction
 * @property {Discord.Client} client
 * @property {Manager} manager
 */

/**
 * @typedef CommandOptions
 * @property {DiscordBuilder.SlashCommandBuilder} data
 * @property {boolean} [testOnly]
 * @property {boolean} [ownerOnly]
 * @property {boolean} [djOnly]
 * @property {Discord.PermissionString[]} [permissions]
 * @property {Discord.PermissionString[]} [clientPermissions]
 * @property {(obj: CallbackObject) => any} callback
 */

/**
 * 
 * @param {Discord.PermissionString[]} permissions 
 */
function validatePermissions(permissions) {
  for (const permission of permissions) {
    if (!validPermissions.includes(permission)) {
      throw new Error(`Unknown permission node: ${permission}`);
    }
  }
};

async function loadDJRoles(client) {
  const results = await djRoleSchema.find({});

  if (!results) return;

  for (const result of results) {
    const guildId = result.guildId;
    const roleId = result.roleId;

    djRolesCache[guildId] = roleId;
  }
}

/**
 * @param {CommandOptions} commandOptions 
 */
module.exports = async (commandOptions) => {
  let {
    data,
    permissions = [],
    clientPermissions = [],
    callback,
  } = commandOptions;

  if (permissions.length) {
    validatePermissions(permissions);
  };

  if (clientPermissions.length) {
    validatePermissions(clientPermissions);
  };

  allCommands[data.name] = {
    ...commandOptions,
    permissions,
    clientPermissions,
  };
}

/**
 * 
 * @param {Discord.Client} client 
 * @param {Manager} manager
 */
module.exports.listen = async (client, manager) => {
  await loadDJRoles(client);
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { guild, channel, commandName, member: intMember, user } = interaction;

    for (const name in allCommands) {
      const command = allCommands[name];

      const {
        data,
        testOnly = true,
        ownerOnly = false,
        permissions,
        clientPermissions,
        callback,
        djOnly = false,
      } = command;

      if (commandName === data.name) {
        if (ownerOnly === true) {
          if (!client.owners.includes(interaction.member.user.id)) {
            interaction.reply({
              content: `This command is for owners only!`,
              ephemeral: true,
            });
            return;
          };
        };

        for (const permission of permissions) {
          if (!intMember.permissions.has(permission)) {
            interaction.reply({
              content: `You do not have enough permissions to use this command!`,
              ephemeral: true,
            });
            return;
          }
        };

        for (const permission of clientPermissions) {
          if (!guild.me.permissions.has(permission)) {
            interaction.reply({
              content: `**${client.user.username}** doesn't have the required permissions to execute this command!`,
              ephemeral: true,
            })
            return;
          }
        };

        if (djOnly === true) {
          const result = djRolesCache[guild.id];

          if (result) {
            const member = guild.members.cache.get(intMember.id);

            const validRole = member.roles.cache.get(result);

            if (!validRole) {
              return interaction.reply({
                content: 'This command is for DJs only!',
                ephemeral: true,
              })
            }
          }
        }

        callback({ interaction, client, manager });
      }
    }
  })
}

module.exports.updateDJRole = async (guildId, roleId) => {
  await djRoleSchema.findOneAndUpdate(
    {
      guildId: guildId,
    },
    {
      guildId,
      roleId,
    },
    {
      upsert: true,
    }
  );

  djRolesCache[guildId] = roleId;
}