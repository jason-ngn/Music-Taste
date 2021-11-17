const mongoose = require('mongoose');

const announceSongsSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  announceSongs: {
    type: Boolean,
    required: true,
  },
});

const name = 'announce-songs';

module.exports = mongoose.models[0] || mongoose.model(name, announceSongsSchema, name);