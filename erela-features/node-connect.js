const Discord = require('discord.js');
const { Manager } = require('erela.js');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Manager} manager 
 */
module.exports = async (client, manager) => {
  manager.on('nodeConnect', node => {
    console.log(`Node ${node.options.identifier} connected!`);
  })

  manager.on('nodeConnect', node => {})
}