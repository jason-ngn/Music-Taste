const { Client } = require('discord.js')
const { Manager } = require('erela.js');

/**
 * 
 * @param {Client} client 
 * @param {Manager} manager 
 */
module.exports = (client, manager) => {
  manager.on('nodeError', (node, error) => {
    console.log(`Node ${node.options.identifier} had an error:`, error.message);
  })
}