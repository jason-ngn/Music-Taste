require('dotenv').config();
const Discord = require('discord.js');

const loadLoaders = require('./loaders/load-loaders');

const client = new Discord.Client({
  intents: ['GUILDS', 'DIRECT_MESSAGES', 'GUILD_MESSAGES'],
});

loadLoaders(client);

client.login(process.env.TOKEN);