const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
  const loaders = [];

  const readLoaders = async (dir) => {
    const files = fs.readdirSync(path.join(__dirname, dir));
    for (const file of files) {
      const stat = fs.lstatSync(path.join(__dirname, dir, file));
      if (stat.isDirectory()) {
        readLoaders(path.join(dir, file));
      } else if (file !== 'load-loaders.js') {
        const loader = require(path.join(__dirname, dir, file));
        loaders.push(file);
        console.log(`Enabling loader: ${file}`);
        loader(client);
      }
    }
  }

  readLoaders('.');

  return loaders;
};