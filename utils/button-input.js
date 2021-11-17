const buttonMenu = require('./button-menu');
const Discord = require('discord.js');

/**
 * 
 * @param {boolean} useButtons 
 * @param {any} message 
 * @param {Discord.Message} botMessage 
 * @param {boolean} isGuessFilter 
 */
module.exports = async (useButtons, message, botMessage, isGuessFilter) => {
  if (useButtons) {
    let yes = new Discord.MessageButton()
    .setLabel('Yes')
    .setStyle('SUCCESS')
    .setCustomId("✅")

    let no = new Discord.MessageButton()
        .setLabel('No')
        .setStyle('DANGER')
        .setCustomId("❌")

    let idk = new Discord.MessageButton()
        .setLabel('Don\'t know')
        .setStyle('PRIMARY')
        .setCustomId("❓")

    let probably = new Discord.MessageButton()
        .setLabel('Probably')
        .setStyle('PRIMARY')
        .setCustomId("👍")

    let probablyNot = new Discord.MessageButton()
        .setLabel('Probably not')
        .setStyle('PRIMARY')
        .setCustomId("👎")

    let back = new Discord.MessageButton()
        .setLabel('Undo')
        .setStyle('PRIMARY')
        .setCustomId("⏪")

    let stop = new Discord.MessageButton()
        .setLabel('')
        .setStyle('PRIMARY')
        .setEmoji("🗑️")
        .setCustomId("🛑")

    let answerTypes = [];

    if (isGuessFilter) {
      answerTypes = [yes, no];
    } else {
      answerTypes = [yes, no, idk, probably, probablyNot, back, stop];
    };

    let choice = await buttonMenu(message.client, message, botMessage, answerTypes, 60000);
    if (!choice) return null;
    else return choice;
  }
}