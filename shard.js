require('dotenv').config();
const { ShardingManager } = require('discord.js');
const token = process.env.TOKEN;

const manager = new ShardingManager('./index.js', {
  token: token,
  totalShards: 'auto',
});

manager.on('shardCreate', async shard => {
  console.log(`[${new Date().toLocaleTimeString()}] Launched shard #${shard.id}`);
});

manager.spawn(manager.totalShards);