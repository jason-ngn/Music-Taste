const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
  const features = [];

  const readFeatures = async dir => {
    const files = fs.readdirSync(path.join(__dirname, dir));
    for (const file of files) {
      const stat = fs.lstatSync(path.join(__dirname, dir, file));
      if (stat.isDirectory()) {
        readFeatures(path.join(dir, file));
      } else {
        const feature = require(path.join(__dirname, dir, file));
        features.push(file);
        console.log(`Enabling feature: ${file}`);
        feature(client);
      }
    }
  };

  readFeatures('../features');

  return features;
}