const Discord = require('discord.js');
const DiscordBuilder = require('@discordjs/builders');
const { Manager } = require('erela.js');
const axios = require('axios').default;
const categoriesURL = 'https://opentdb.com/api_category.php';
const wait = require('util').promisify(setTimeout);
const categories = [
  ['General Knowledge', '9'],
  ['Entertainment: Books', '10'],
  ['Entertainment: Film', '11'],
  ['Entertainment: Music', '12'],
  ['Entertainment: Musicals & Theatres', '13'],
  ['Entertainment: Television', '14'],
  ['Entertainment: Video Games', '15'],
  ['Entertainment: Board Games', '16'],
  ['Science & Nature', '17'],
  ['Science: Computers', '18'],
  ['Science: Mathematics', '19'],
  ['Mythology', '20'],
  ['Sports', '21'],
  ['Geography', '22'],
  ['History', '23'],
  ['Politics', '24'],
  ['Art', '25'],
  ['Celebrities', '26'],
  ['Animals', '27'],
  ['Vehicles', '28'],
  ['Entertainment: Comics', '29'],
  ['Science: Gadgets', '30'],
  ['Entertainment: Anime & Manga', '31'],
  ['Entertainment: Cartoon & Animations', '32']
];
const AEmoji = '🇦', AId = 'a';
const BEmoji = '🇧', BId = 'b';
const CEmoji = '🇨', CId = 'c';
const DEmoji = '🇩', DId = 'd';
const trueId = 'True', falseId = 'False';

/**
 * 
 * @param {Array} array 
 */
function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);

    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex],
    ];
  };

  return array;
}

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
* @property {Discord.PermissionString[]} [permissions]
* @property {Discord.PermissionString[]} [clientPermissions]
* @property {(obj: CallbackObject) => any} callback
*/

const data = new DiscordBuilder.SlashCommandBuilder()
.setName('trivia')
.setDescription('Starts a game of trivia!')
.addStringOption(option => {
  return option
  .setName('type')
  .setDescription('The type of answers of the trivia')
  .addChoices([
    ['Multiple Choice', 'multiple choice'],
    ['True / False', 'true false'],
    ['Any type', 'any']
  ])
  .setRequired(false)
})
.addStringOption(option => {
  return option
  .setName('difficulty')
  .setDescription('The difficulty of the game')
  .setRequired(false)
  .addChoices([
    ['Easy', 'easy'],
    ['Medium', 'medium'],
    ['Hard', 'hard'],
    ['Any', 'any'],
  ])
})
.addStringOption(option => {
  return option
  .setName('category')
  .setDescription('The category of the trivia')
  .setRequired(false)
  .addChoices(categories)
})

/**
* @type {CommandOptions}
*/
const commandBase = {
  data,
  testOnly: false,
  callback: async ({ interaction, client, manager }) => {
    await interaction.deferReply();
    await wait(700);
    let baseURL = `https://opentdb.com/api.php?amount=10`;

    const type = interaction.options.getString('type');
    const difficulty = interaction.options.getString('difficulty');
    const category = interaction.options.getString('category');

    if (type) {
      if (type === 'multiple choice') baseURL += `&type=multiple`;
      else if (type === 'true false') baseURL += `&type=boolean`;
    };

    if (difficulty) {
      if (difficulty === 'easy') baseURL += `&difficulty=easy`;
      else if (difficulty === 'medium') baseURL += `&difficulty=medium`;
      else if (difficulty === 'hard') baseURL += `&difficulty=hard`;
    };

    if (category) {
      baseURL += `&category=${category}`;
    };

    // Buttons
    const AButton = new Discord.MessageButton()
    .setCustomId(AId)
    .setLabel('A')
    .setStyle('PRIMARY')
    const BButton = new Discord.MessageButton()
    .setCustomId(BId)
    .setLabel('B')
    .setStyle('PRIMARY')
    const CButton = new Discord.MessageButton()
    .setCustomId(CId)
    .setLabel('C')
    .setStyle('PRIMARY')
    const DButton = new Discord.MessageButton()
    .setCustomId(DId)
    .setLabel('D')
    .setStyle('PRIMARY')
    const trueButton = new Discord.MessageButton()
    .setCustomId(trueId)
    .setLabel('True')
    .setStyle('PRIMARY')
    const falseButton = new Discord.MessageButton()
    .setCustomId(falseId)
    .setLabel('False')
    .setStyle('PRIMARY')  

    await axios.get(baseURL).then(async res => {
      const { results } = res.data;

      const questionObj = results[0];

      let question = '';

      if (questionObj.question.includes('&quot;')) {
        question = questionObj.question.replace(/(&quot;)+/g, '"');
      } else {
        question.length ? question = question : question = questionObj.question;
      }

      if (questionObj.question.includes('&#039;')) {
        question = questionObj.question.replace(/(&#039;)+/g, `'`);
      } else {
        question.length ? question = question : question = questionObj.question;
      }

      if (questionObj.question.includes('&amp;')) {
        question = questionObj.question.replace(/(&amp;)+/g, '&')
      } else {
        question.length ? question = question : question = questionObj.question;
      }

      if (questionObj.question.includes('&shy;')) {
        question = questionObj.question.replace(/(&shy;)+/g, '-')
      } else {
        question.length ? question = question : question = questionObj.question;
      }

      if (questionObj.question.includes('&ldquo;')) {
        question = questionObj.question.replace(/(&ldquo;)+/g, '"')
      } else {
        question.length ? question = question : question = questionObj.question;
      }

      const questionEmbed = new Discord.MessageEmbed()
      .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
      .setColor("WHITE")
      .setTitle(question)
      .setFooter(`Click the button of the correct answer!`)

      const multipleChoiceObject = {
        a: '',
        b: '',
        c: '',
        d: '',
        true: '',
      };

      const yesNoObject = {
        True: '',
        False: '',
        correctAnswer: '',
      };
      
      let row = new Discord.MessageActionRow();
      if (questionObj.type === 'multiple') {
        let text = '';
        const correctAnswer = questionObj.correct_answer;
        const incorrectAnswers = questionObj.incorrect_answers;

        const answers = [correctAnswer, ...incorrectAnswers];

        const shuffledAnswers = await shuffleArray(answers);
        const answersPrefix = ['A)', 'B)', 'C)', 'D)'];

        if (correctAnswer.includes('&rsquo;')) {
          correctAnswer.replace(/(&rsquo;)/g, `'`);
        };

        if (correctAnswer.includes('&Uuml;')) {
          correctAnswer.replace(/(&Uuml;)/g, `Ü`);
        };

        for (const answer of shuffledAnswers) {
          if (answer.includes('&rsquo;')) {
            answer.replace(/(&rsquo;)/g, `'`);
          }

          if (answer.includes('&Uuml;')) {
            answer.replace(/(&Uuml;)/g, `Ü`);
          }
        };

        for (let i = 0; i < shuffledAnswers.length; i++) {
          text += `\`${answersPrefix[i]}\` ${shuffledAnswers[i]}\n`;
        };

        multipleChoiceObject.a = shuffledAnswers[0]
        multipleChoiceObject.b = shuffledAnswers[1]
        multipleChoiceObject.c = shuffledAnswers[2]
        multipleChoiceObject.d = shuffledAnswers[3]
        multipleChoiceObject.true = correctAnswer;

        questionEmbed.setDescription(text);
        row = new Discord.MessageActionRow().addComponents(AButton, BButton, CButton, DButton);
      } else if (questionObj.type === 'boolean') {
        let text = '';
        const correctAnswer = questionObj.correct_answer;
        const incorrectAnswer = questionObj.incorrect_answers[0];

        let answers = [];

        if (correctAnswer === 'True') {
          answers = [correctAnswer, incorrectAnswer];
        } else if (correctAnswer === 'False') {
          answers = [incorrectAnswer, correctAnswer];
        };

        const answersPrefix = ['A)', 'B)'];
        for (let i = 0; i < answers.length; i++) {
          text += `\`${answersPrefix[i]}\` **${answers[i]}**\n`;
        };

        yesNoObject.True = answers[0]
        yesNoObject.False = answers[1];
        yesNoObject.correctAnswer = correctAnswer;

        questionEmbed.setDescription(text);
        row = new Discord.MessageActionRow().addComponents(trueButton, falseButton);
      }

      await interaction.editReply({
        embeds: [questionEmbed],
        components: row.components.length > 0 ? [row] : [],
      }).catch(err => {
        throw err;
      })

      if (row.components.length < 0) return;

      const collector = interaction.channel.createMessageComponentCollector({
        filter: buttonInt => buttonInt.user.id === interaction.user.id,
        max: 1,
      });

      collector.on('end', async collected => {
        const button = collected.first();

        if (questionObj.type === 'multiple') {
          if (multipleChoiceObject[button.customId] === multipleChoiceObject.true) {
            let buttonRow = [AButton, BButton, CButton, DButton];
  
            const winButton = buttonRow.filter(but => but.customId === button.customId);
  
            for (const but of buttonRow) {
              if (but.customId !== winButton[0].customId) {
                but.setStyle('DANGER').setDisabled(true);
              } else {
                but.setStyle('SUCCESS').setDisabled(true);
              }
            };
  
            await button.update({
              embeds: [button.message.embeds[0].setFooter(`The correct answer is ${winButton[0].customId.toUpperCase()}, You won!`)],
              components: [new Discord.MessageActionRow({
                components: buttonRow,
              })]
            })
            return;
          } else {
            let buttonRow = [AButton, BButton, CButton, DButton];

            const trueAnswer = multipleChoiceObject.true;
            let correctAnswerId = '';

            for (const key in multipleChoiceObject) {
              if (key !== 'true') {
                if (multipleChoiceObject[key] === trueAnswer) {
                  correctAnswerId = key;
                }
              }
            };

            const winButton = buttonRow.filter(but => but.customId === correctAnswerId);

            for (const but of buttonRow) {
              if (but.customId !== winButton[0].customId) {
                but.setStyle('DANGER').setDisabled(true)
              } else {
                but.setStyle('SUCCESS').setDisabled(true)
              }
            };

            await button.update({
              components: [new Discord.MessageActionRow({
                components: buttonRow
              })],
              embeds: [button.message.embeds[0].setFooter(`The correct answer is ${winButton[0].customId.toUpperCase()}, You lost!`)]
            })
          }
        } else if (questionObj.type === 'boolean') {
          if (yesNoObject[button.customId] === yesNoObject.correctAnswer) {
            let buttonRow = [trueButton, falseButton];

            const winButton = buttonRow.filter(but => but.customId === button.customId);

            for (const but of buttonRow) {
              if (but.customId !== winButton[0].customId) {
                but.setStyle("DANGER").setDisabled(true)
              } else {
                but.setStyle('SUCCESS').setDisabled(true)
              }
            };

            await button.update({
              embeds: [button.message.embeds[0].setFooter(`The correct answer is ${winButton[0].customId}, You won!`)],
              components: [new Discord.MessageActionRow({
                components: buttonRow,
              })]
            })
          } else {
            let buttonRow = [trueButton, falseButton];

            const trueAnswer = yesNoObject.correctAnswer;

            let correctAnswerId = '';

            for (const key in yesNoObject) {
              if (key !== 'correctAnswer') {
                if (yesNoObject[key] === trueAnswer) {
                  correctAnswerId = key;
                }
              }
            };

            const winButton = buttonRow.filter(but => but.customId === correctAnswerId);

            for (const but of buttonRow) {
              if (but.customId !== winButton[0].customId) {
                but.setStyle("DANGER").setDisabled(true)
              } else {
                but.setStyle("SUCCESS").setDisabled(true)
              }
            };

            await button.update({
              components: [new Discord.MessageActionRow({
                components: buttonRow,
              })],
              embeds: [button.message.embeds[0].setFooter(`The correct answer is ${winButton[0].customId}, You lost!`)]
            })
          }
        }
      })
    }).catch(async err => {
      await interaction.editReply({
        content: 'There was a problem when searching the database for questions! Please report to **IcyTea#1760** by `/error <error>` or by DM!',
      })
      throw err;
    })
  },
};

module.exports = commandBase;