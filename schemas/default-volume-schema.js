const mongoose = require('mongoose');

const defaultVolumeSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  volume: {
    type: Number,
    required: true,
  }
});

const name = 'default-volumes';

module.exports = mongoose.models[0] || mongoose.model(name, defaultVolumeSchema, name);