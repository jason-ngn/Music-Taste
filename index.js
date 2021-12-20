require('dotenv').config();
const Discord = require('discord.js');
const musicManager = require('./music-manager');

const loadLoaders = require('./loaders/load-loaders');
const backend = require('./backend/app');
const commandHandler = require('./handlers/command-handler');
const mongoose = require('mongoose');
const mongoPath = process.env.MONGO_URI
let totalMembers = 0;
let totalServers = 0;
let i = 0;
const {
  putBotInfo
} = require('./utils/api');

const client = new Discord.Client({
  intents: [
    'GUILDS',
    'GUILD_MEMBERS',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'GUILD_PRESENCES',
    'GUILD_VOICE_STATES',
  ],
});

client.owners = [
  '754982406393430098',
  '403925308320907276',
];

client.testServers = [
  '773477649174626344',
  '865878769373937666'
]

client.on('ready', async () => {
  for (const guild of client.guilds.cache) {
    totalMembers += guild[1].memberCount;
    totalServers += 1;
  }

  console.log(`${client.user.tag} has logged in!`);
  console.log(`Listening to ${totalMembers.toLocaleString()} user(s), ${totalServers.toLocaleString()} server(s)!`);

  const statusArray = [
    {
      name: '/help',
      type: 'LISTENING',
    },
    {
      name: 'IcyTea#1760',
      type: 'LISTENING',
    },
    {
      name: `${totalMembers.toLocaleString()} user(s) | ${totalServers.toLocaleString()} server(s)!`,
      type: "LISTENING"
    }
  ];
    
  await mongoose.connect(mongoPath, {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    autoIndex: false,
  }).then(() => console.log(`Successfully connected to Mongo DB!`))
  .catch(err => {
    throw err;
  });
  
  const manager = await musicManager(client);

  manager.init(client.user.id);
  await commandHandler.loadPrefix(client);

  await loadLoaders(client, manager);
  //loadLanguages(client);
  await backend(client);

  const statusFunction = () => {
    client.user.setPresence({
      activities: [
        {
          name: statusArray[i].name,
          type: statusArray[i].type
        }
      ],
      status: 'online'
    });

    if (i === (statusArray.length - 1)) {
      i = 0
    } else {
      i += 1
    };

    setTimeout(statusFunction, 1000 * 15);
  };

  statusFunction();

  const botInfo = {
    id: client.user.id,
    tag: client.user.tag,
    guilds: totalServers,
    users: totalMembers,
    channels: client.channels.cache.size,
  };
  
  await putBotInfo(botInfo).catch(err => {
    console.error(err);
  });
});

client.login(process.env.TOKEN);
