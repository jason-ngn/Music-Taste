const embedConstructor = require('../../utils/embed');
const Discord = require('discord.js');
const { Aki } = require('aki-api');
const fs = require('fs');
const awaitInput = require('../../utils/button-input');
const games = new Set();
const attemptingGuess = new Set();

/**
* @typedef CommandOptions
* @property {string|string[]} commands
* @property {string} [description]
* @property {number} [minArgs]
* @property {number} [maxArgs]
* @property {number} [cooldown]
* @property {string} [expectedArgs]
* @property {Discord.PermissionString[]} [permissions]
* @property {Discord.PermissionString[]} [clientPermissions]
* @property {boolean} [ownerOnly]
* @property {(message: Discord.Message, args: string[], text: string, client: Discord.Client) => any} callback
*/

/**
 * 
 * @param {Discord.ButtonInteraction} interaction 
 * @returns {string}
 */
function getButtonReply(interaction) {
  interaction = interaction.customId;

  if (interaction === '✅') {
    return 'y';
  } else if (interaction === '❌') {
    return 'n';
  } else if (interaction === '❓') {
    return 'i';
  } else if (interaction === '👍') {
    return 'p';
  } else if (interaction === '👎') {
    return 'pn';
  } else if (interaction === '⏪') {
    return 'b';
  } else if (interaction === '🛑') {
    return 's';
  } else return null;
};

/**
* @type {CommandOptions}
*/
const commandBase = {
  commands: ['akinator', 'aki'],
  ownerOnly: true,
  callback: async (message, args, text, client) => {
    let inputData = {};

    try {
      try {
        inputData.client = client;
        inputData.guild = message.guild;
        inputData.author = message.author;
        inputData.channel = message.channel;
      } catch {
        throw new Error('Failed to parse input for use!');
      };

      let userTag = inputData.author.tag;
      let avatar = inputData.author.displayAvatarURL({ dynamic: true });

      if (games.has(inputData.author.id)) {
        let alreadyPlayingEmbed = embedConstructor(message, {
          description: `You are already playing a game of Akinator!`,
        });

        message.reply({
          embeds: [alreadyPlayingEmbed],
        });
        return;
      };

      games.add(inputData.author.id);

      let gameTypeRegion = 'en';
      let aki = new Aki({ region: gameTypeRegion });
      await aki.start();

      let notFinished = true;
      let stepsSinceLastGuess = 0;
      let hasGuessed = false;

      let noResEmbed = embedConstructor(message, {
        title: 'The game has ended!',
        description: `There is no response from **${inputData.author.username}** so the game has ended!`,
      });

      let akiEmbed = embedConstructor(message, {
        title: `Akinator game!`,
        description: `Question **${aki.currentStep + 1}**: ${aki.question}`,
      });

      let akiMessage = await inputData.channel.send({
        embeds: [akiEmbed],
      });

      inputData.client.on('messageDelete', async deletedMessage => {
        if (deletedMessage.id === akiMessage.id) {
          notFinished = false;
          games.delete(inputData.author.id);
          attemptingGuess.delete(inputData.author.id);
          await aki.win();
          return;
        }
      });

      while (notFinished) {
        if (!notFinished) return;

        stepsSinceLastGuess += 1;

        if (((aki.progress >= 80 && (stepsSinceLastGuess >= 10 || hasGuessed === false)) || aki.currentStep >= 78) && (!attemptingGuess.has(inputData.guild.id))) {
          attemptingGuess.add(inputData.guild.id);
          await aki.win();

          stepsSinceLastGuess = 0;
          hasGuessed = true;

          let guessEmbed = embedConstructor(message, {
            title: 'Akinator game!',
            description: `I'm **${Math.round(aki.progress)}%** sure your character is... **${aki.answers[0].name}**`,
            image: {
              url: aki.answers[0].absolute_picture_path,
            }
          });

          // await akiMessage.edit({
          //   embeds: [guessEmbed],
          // });
          akiMessage.embeds[0] = guessEmbed;

          await awaitInput(true, inputData, akiMessage, true)
          .then(async response => {
            if (response === null) {
              notFinished = false;
              games.delete(inputData.author.id);
              akiMessage.edit({ embeds: [noResEmbed], components: [] });
              return;
            };

            let reply = getButtonReply(response) || response;
            const guessAnswer = reply.toLowerCase();

            attemptingGuess.delete(inputData.guild.id);

            if (guessAnswer === 'y') {
              let finishedGameCorrect = embedConstructor(message, {
                title: 'Well played!',
                description: `I won! I guessed right one more time!`,
              });
              await response.update({
                embeds: [finishedGameCorrect],
                components: [],
              });
              notFinished = false;
              games.delete(inputData.author.id);
              return;
            } else if (guessAnswer === 'n') {
              if (aki.currentStep >= 78) {
                let finishedGameDefeated = embedConstructor(message, {
                  title: 'Well played!',
                  description: `You won! I lost this time, lucky!`,
                });
                await response.update({
                  embeds: [finishedGameDefeated],
                  components: [],
                });
                notFinished = false;
                games.delete(inputData.author.id);
              } else {
                await response.update({
                  embeds: [guessEmbed],
                  components: [],
                })
                aki.progress = 50;
              }
            }
          })
        } else if (aki.currentStep === 80) {
          let finishedGameDefeated = embedConstructor(message, {
            title: 'Well played!',
            description: `You won! I lost this time, lucky!`,
          });
          await akiMessage.edit({
            embeds: [finishedGameDefeated],
            components: [],
          });
          notFinished = false;
          games.delete(inputData.author.id);
          return;
        }

        if (!notFinished) return;

        if (aki.currentStep !== 0) {
          let updatedAkiEmbed = embedConstructor(message, {
            title: 'Akinator game!',
            description: `Question **${aki.currentStep + 1}**: ${aki.question}`,
          })

          // await akiMessage.edit({ embeds: [updatedAkiEmbed ] });
          akiMessage.embeds[0] = updatedAkiEmbed;
        };

        await awaitInput(true, inputData, akiMessage, false)
        .then(async response => {
          if (response === null) {
            await aki.win();
            notFinished = false;
            games.delete(inputData.author.id);
            return akiMessage.edit({ embeds: [noResEmbed], components: [] });
          };

          let reply = getButtonReply(response) || response;
          const answer = reply.toLowerCase();

          const answers = {
            "y": 0,
            "n": 1,
            "i": 2,
            "p": 3,
            "pn": 4,
          };

          let thinkingEmbed = embedConstructor(message, {
            title: 'Akinator game!',
            description: `Question **${aki.currentStep + 1}**: ${aki.question}`,
          });

          await response.update({
            embeds: [thinkingEmbed],
          });

          if (answer === 'b') {
            if (aki.currentStep >= 1) {
              await aki.back();
            }
          } else if (answer === 's') {
            games.delete(inputData.author.id);
            let stopEmbed = embedConstructor(message, {
              title: 'Akinator game!',
              description: `**${inputData.author.username}** has stopped the game!`,
            });
            await aki.win();
            await akiMessage.edit({
              embeds: [stopEmbed],
              components: [],
            });
            notFinished = false;
          } else {
            await aki.step(answers[answer]);
          };

          if (!notFinished) return;
        })
      }
    } catch (e) {
      attemptingGuess.delete(inputData.guild.id);
      games.delete(inputData.guild.id)
      if (e === 'DiscordAPIError: Unknown Message') return;
      else if (e === 'DiscordAPIError: Cannot send an empty message') throw new Error('Discord.js v13 or higher is required!');
      throw new Error(`Akinator error:`, e);
    }
  },
};

module.exports = commandBase;

