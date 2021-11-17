const Discord = require('discord.js');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {Discord.Message} botMessage 
 * @param {MessageButton[]} buttons 
 * @param {number} time 
 */
module.exports = async (client, message, botMessage, buttons, time) => {
  if (!client) throw new Error(`Button menu error: no client provided`)
  if (!message) throw new Error(`Button menu error: no message provided`)
  if (!botMessage) throw new Error(`Button menu error: no bot message provided`)
  if (!buttons) throw new Error(`Button menu error: no buttons provided`)
  if (!time) throw new Error(`Button menu error: no time provided`);

  let buttonRow = new Discord.MessageActionRow();
  let buttonRow2 = new Discord.MessageActionRow();
  let buttonRows = [];

  for (let i = 0; i < buttons.length; i++) {
    if (i < 5) {
      buttonRow.addComponents(buttons[i]);
    } else {
      buttonRow2.addComponents(buttons[i]);
    };
  };

  buttonRows.push(buttonRow);
  if (buttons.length >= 5) buttonRows.push(buttonRow2);

  botMessage = await botMessage.edit({
    embeds: [botMessage.embeds[0]],
    components: buttonRows,
  });

  let selection;

  await botMessage.channel.awaitMessageComponent({
    filter: (i) => i.user.id === message.author.id,
    time: 60000,
    componentType: 'BUTTON',
  })
  .then(async i => {
    selection = i;
  }).catch(() => {

  });

  return selection;
}