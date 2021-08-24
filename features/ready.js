const commandHandler = require('../handlers/command-handler');

module.exports = async (client) => {
  client.on('ready', async () => {
    console.log(`${client.user.tag} has logged in!`);

    commandHandler.loadPrefix(client);
  });
};