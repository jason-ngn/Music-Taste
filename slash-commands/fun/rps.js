const Discord = require('discord.js');
const DiscordBuilder = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

/**
* @typedef CallbackObject
* @property {Discord.CommandInteraction} interaction
* @property {Discord.Client} client
*/

/**
* @typedef CommandOptions
* @property {DiscordBuilder.SlashCommandBuilder} data
* @property {boolean} [testOnly]
* @property {boolean} [ownerOnly]
* @property {Discord.PermissionString[]} [permissions]
* @property {Discord.PermissionString[]} [clientPermissions]
* @property {(obj: CallbackObject) => any} callback
*/

const data = new DiscordBuilder.SlashCommandBuilder()
.setName('rps')
.setDescription('Starts a rock paper scissor game!')
.addStringOption(option => {
  return option
  .setName('choice')
  .setDescription('Your choice.')
  .setRequired(true)
  .addChoice('Rock', 'Rock')
  .addChoice('Paper', 'Paper')
  .addChoice('Scissor', 'Scissor')
})


/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  callback: async ({ interaction, client }) => {
    await interaction.deferReply();
    await wait(2000);
    const botChoice = Math.floor(Math.random() * 2) * 1;

    let botEmoji, playerEmoji, botChoiceStr;

    if (botChoice === 1) {
      botChoiceStr = 'rock';
      botEmoji = '🪨 Rock'
    } else if (botChoice === 2) {
      botChoiceStr = 'paper';
      botEmoji = '🧻 Paper'
    } else if (botChoice === 3) {
      botChoiceStr = 'scissor';
      botEmoji = '✂️ Scissor'
    }

    const userChoice = interaction.options.getString('choice');

    if (botChoiceStr === userChoice.toLowerCase()) {
      return await interaction.editReply({
        content: `I picked: ${botEmoji}, you picked ${userChoice}. We tied!`,
      });
    };

    if (userChoice.toLowerCase() === 'rock') {
      if (botChoiceStr === 'paper') {
        return await interaction.editReply({
          content: `I picked: ${botEmoji}, you picked: ${userChoice}. You lost!`,
        })
      } else if (botChoiceStr === 'scissor') {
        return await interaction.editReply({
          content: `I picked: ${botEmoji}, you picked: ${userChoice}. You won!`,
        })
      }
    } else if (userChoice.toLowerCase() === 'paper') {
      if (botChoiceStr === 'rock') {
        return await interaction.editReply({
          content: `I picked: ${botEmoji}, you picked: ${userChoice}. You won!`,
        })
      } else if (botChoiceStr === 'scissor') {
        return await interaction.editReply({
          content: `I picked: ${botEmoji}, you picked: ${userChoice}. You lost!`,
        })
      }
    } else if (userChoice.toLowerCase() === 'scissor') {
      if (botChoiceStr === 'paper') {
        return await interaction.editReply({
          content: `I picked: ${botEmoji}, you picked: ${userChoice}. You won!`,
        })
      } else if (botChoiceStr === 'rock') {
        return await interaction.editReply({
          content: `I picked: ${botEmoji}, you picked: ${userChoice}. You won!`,
        })
      }
    }
  },
};

module.exports = commandBase;