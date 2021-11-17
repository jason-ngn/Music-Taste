const axios = require('axios').default;

module.exports = () => {}

module.exports.putBotInfo = async (botInfo) => {
  await axios.put('http://localhost:3003/api/putbotinfo', botInfo);
}