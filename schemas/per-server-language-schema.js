const mongoose = require('mongoose');

const reqString = {
  type: String,
  required: true,
}

const languageSchema = new mongoose.Schema({
  guildId: reqString,
  language: {
    type: String,
    required: true,
    default: 'en',
  },
});

module.exports = mongoose.model('per-server-languages', languageSchema);