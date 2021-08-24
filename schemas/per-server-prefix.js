const mongoose = require('mongoose');

const reqString = {
  type: String,
  required: true,
};

const perServerPrefixSchema = new mongoose.Schema({
  guildId: reqString,
  prefix: reqString,
});

module.exports = mongoose.model('per-server-prefixes', perServerPrefixSchema);