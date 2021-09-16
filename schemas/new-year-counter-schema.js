const mongoose = require('mongoose');

const reqString = {
  type: String,
  required: true,
}

const newYearSchema = new mongoose.Schema({
  guildId: reqString,
  channelId: reqString
});

module.exports = mongoose.model('new-year-channels', newYearSchema);