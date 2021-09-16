const translate = require('@vitalets/google-translate-api');
const guildLanguagesCache = {};
const globalLanguage = 'en';
const languageSchema = require('../schemas/per-server-language-schema');

const translateSentence = async (guild, query) => {
  const result = await translate(query, {
    to: guildLanguagesCache[guild.id] ? guildLanguagesCache[guild.id] : globalLanguage,
  }).then(async res => {
    return res.text;
  });

  return result
}

module.exports = async (guild, query) => {
  translateSentence(guild, query).then(res => {
    return res;
  });
};

module.exports.updateLanguage = async (guild, language) => {
  await languageSchema.findOneAndUpdate(
    {
      guildId: guild.id,
    },
    {
      guildId: guild.id,
      language,
    },
    {
      upsert: true,
    }
  );

  guildLanguagesCache[guild.id] = language;
};

module.exports.loadLanguages = async client => {
  for (const guild of client.guilds.cache) {
    const guildId = guild[1].id;

    const result = await languageSchema.findOne({ guildId });
    guildLanguagesCache[guildId] = result ? result.language : globalLanguage;
  };

  console.log(`Loading languages for ${client.guilds.cache.size.toLocaleString()} server(s)!`);
};

module.exports.getLanguage = guild => {
  return guildLanguagesCache[guild.id];
};
