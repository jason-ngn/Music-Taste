const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  tracks: {
    type: [Object],
    required: true,
  }
});

const name = 'playlists';

module.exports = mongoose.models[0] || mongoose.model(name, playlistSchema, name);