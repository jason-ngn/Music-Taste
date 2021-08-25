require('dotenv').config();
const Discord = require('discord.js');

const loadLoaders = require('./loaders/load-loaders');

const client = new Discord.Client({
  intents: ['GUILDS', 'DIRECT_MESSAGES', 'GUILD_MESSAGES', 'GUILD_BANS', 'GUILD_INVITES', 'GUILD_MEMBERS', 'GUILD_MESSAGE_REACTIONS'],
});

client.owners = [
  '754982406393430098',
  '403925308320907276',
];

loadLoaders(client);

client.login(process.env.TOKEN);