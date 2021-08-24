const commandHandler = require('../handlers/command-handler');
const mongoose = require('mongoose');
const mongoPath = 'mongodb+srv://Jason:620521@icybot.bcikm.mongodb.net/IcyBot-DiscordJS-13?retryWrites=true&w=majority';
let totalMembers = 0;
let totalServers = 0;

module.exports = async (client) => {
  client.on('ready', async () => {
    for (const guild of client.guilds.cache) {
      totalMembers += guild[1].memberCount;
      totalServers += 1;
    }

    console.log(`${client.user.tag} has logged in!`);
    console.log(`Listening to ${totalMembers.toLocaleString()} user(s), ${totalServers.toLocaleString()} server(s)!`);

    mongoose.connect(mongoPath, {
      keepAlive: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      autoIndex: false,
    }).then(() => console.log(`Successfully connected to Mongo DB!`))
    .catch(err => {
      throw err;
    });

    commandHandler.loadPrefix(client);
  });
};