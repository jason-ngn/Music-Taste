const Discord = require('discord.js');
const newYearSchema = require('../schemas/new-year-counter-schema');
const channelCache = {};
const moment = require('moment');
require('moment-duration-format');

const loadChannels = async () => {
  const channels = await newYearSchema.find({});

  if (!channels) return;

  for (const channel of channels) {
    channelCache[channel.guildId] = channel.channelId;
  };

  setTimeout(loadChannels, 1000 * 10);
};

/**
 * 
 * @param {object} channelCache 
 * @param {Discord.Client} client
 */
const newYearCounter = async (channelCache, client) => {
  function addZero(num, count) {
    return num.toString().padStart(count, '0');
  };

  const newYear = new Date('Jan 1, 2022 00:00:00').getTime();
  let dateCurrent = new Date().getTime(), timeLeft = newYear - dateCurrent;

  let second = 1000, minute = second * 60, hour = minute * 60, day = hour * 24, week = day * 7, month = day * 30;

  let 
  monthLeft = addZero(Math.floor(timeLeft / month), 1),
  weekLeft = addZero(Math.floor((timeLeft % month) / week), 1),
  dayLeft = addZero(Math.floor((timeLeft % week) / day), 1),
  hourLeft = addZero(Math.floor((timeLeft % day) / hour), 2),
  minuteLeft = addZero(Math.floor((timeLeft % hour) / minute), 2),
  secondLeft = addZero(Math.floor((timeLeft % minute) / second), 2),
  daysLeft = addZero(Math.floor(timeLeft / day), 3);

  let timeString = `@everyone\n\n🎉 Time left until New Year 2022: **${monthLeft} months, ${weekLeft} weeks, ${dayLeft} days, ${hourLeft} hours, ${minuteLeft} minutes, ${secondLeft} seconds (${daysLeft} days left)** (UTC time) 🎉`;

  for (const guildId in channelCache) {
    const guild = client.guilds.cache.get(guildId);
    const channelId = channelCache[guildId];

    if (
      monthLeft === '-1' &&
      weekLeft === '-1' &&
      dayLeft === '-1' &&
      hourLeft === '-1' &&
      minuteLeft === '-1' &&
      secondLeft === '-1' &&
      daysLeft === '0-1'
    ) {
      timeString = `@everyone\n\n🎉 **LET'S CELEBRATE!!!! HAPPY NEW YEAR TO EVERYONE IN ${guild.name.toUpperCase()}!!!** 🎉`
    };

    const channel = guild.channels.cache.get(channelId);

    if ((await channel.messages.fetch()).size < 1) {
      if (
        monthLeft === '-1' &&
        weekLeft === '-1' &&
        dayLeft === '-1' &&
        hourLeft === '-1' &&
        minuteLeft === '-1' &&
        secondLeft === '-1' &&
        daysLeft === '0-1'
      ) return channel.send(timeString);
      else channel.send(timeString);
    } else {
      await channel.messages.fetch(channel.lastMessageId).then(msg => {
        if (
          monthLeft === '-1' &&
          weekLeft === '-1' &&
          dayLeft === '-1' &&
          hourLeft === '-1' &&
          minuteLeft === '-1' &&
          secondLeft === '-1' &&
          daysLeft === '0-1'
        ) {
          msg.delete();
          channel.send(timeString);
        }
        else msg.edit(timeString);
      })
    }
  }

  if (
    monthLeft === '-1' &&
    weekLeft === '-1' &&
    dayLeft === '-1' &&
    hourLeft === '-1' &&
    minuteLeft === '-1' &&
    secondLeft === '-1' &&
    daysLeft === '0-1'
  ) return;
  else {
    setTimeout(() => {
      newYearCounter(channelCache, client);
    }, 1000 * 1);
  }
}

loadChannels();
/**
 * 
 * @param {Discord.Client} client 
 */
module.exports = async client => {
  await newYearCounter(channelCache, client);
};