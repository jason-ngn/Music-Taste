const mongoose = require('mongoose');
const reqString = {
  type: String,
  required: true,
}

const djRoleSchema = new mongoose.Schema({
  guildId: reqString,
  roleId: reqString,
});

const name = 'dj-roles';

module.exports = mongoose.models[0] || mongoose.model(name, djRoleSchema, name);