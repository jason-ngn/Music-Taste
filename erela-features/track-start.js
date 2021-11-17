const Discord = require('discord.js');
const Erela = require('erela.js');
const volumes = {};
const defaultVolumeSchema = require('../schemas/default-volume-schema');
const globalVolume = 100;
const trackCache = {};
const announceSongsCache = {};
const announceSongsSchema = require('../schemas/announce-songs-schema');

/**
 * 
 * @param {Discord.Client} client 
 */
async function loadToCache(client) {
  const servers = (await client.guilds.fetch());

  for (const guild of servers) {
    const result = await defaultVolumeSchema.findOne({
      guildId: guild[1].id,
    });

    volumes[guild[1].id] = result ? result.volume : globalVolume;
  };
};

/**
 * 
 * @param {Discord.Client} client 
 */
async function loadAnnounceSongs(client) {
  const servers = (await client.guilds.fetch());

  for (const guild of servers) {
    const result = await announceSongsSchema.findOne({
      guildId: guild[1].id,
    });

    announceSongsCache[guild[1].id] = result ? result.announceSongs : true;
  }
}

/**
 * 
 * @param {Discord.Client} client 
 * @param {Erela.Manager} manager 
 */
module.exports = async (client, manager) => {
  await loadToCache(client);
  await loadAnnounceSongs(client);

  for (const guildId in volumes) {
    trackCache[guildId] = [];
  };

  manager.on('trackStart', async (player, track) => {
    const guild = client.guilds.cache.get(player.guild);

    const channel = guild.channels.cache.get(player.textChannel);

    trackCache[guild.id].push(track.uri);

    if (trackCache[guild.id].length === 1) {
      const volume = volumes[guild.id];
      await player.setVolume(volume);
    } 

    const embed = new Discord.MessageEmbed()
    .setTitle('Now playing!')
    .setColor('WHITE')
    .setThumbnail(track.displayThumbnail(1500))
    .setDescription(`[${track.title}](${track.uri})\nRequested by: <@${track.requester}>`)

    const announceSongs = announceSongsCache[guild.id];

    if (announceSongs === true) {
      channel.send({
        embeds: [embed],
      });
    };
  })
}

/**
 * 
 * @param {Discord.Guild} guild 
 * @param {number} volume 
 */
module.exports.setDefaultVolume = async (guild, volume) => {
  if (!volume || volume < 1 || volume > 100) return;

  await defaultVolumeSchema.findOneAndUpdate(
    {
      guildId: guild.id,
    },
    {
      guildId: guild.id,
      volume,
    },
    {
      upsert: true,
    }
  );

  volumes[guild.id] = volume;
}

/**
 * 
 * @param {Discord.Guild} guild 
 */
module.exports.updateTrackCache = async (guild) => {
  trackCache[guild.id] = [];
};

/**
 * 
 * @param {string} guild 
 */
module.exports.resetTrackCache = async guildId => {
  trackCache[guildId] = [];
};

/**
 * 
 * @param {string} guildId 
 * @param {boolean} boolean 
 */
module.exports.setAnnounceSongs = async (guildId, boolean = true) => {
  await announceSongsSchema.findOneAndUpdate(
    {
      guildId,
    },
    {
      guildId,
      announceSongs: boolean,
    },
    {
      upsert: true,
    }
  );

  announceSongsCache[guildId] = boolean;
};

module.exports.returnAnnounceSongs = async (guildId) => {
  return announceSongsCache[guildId];
};