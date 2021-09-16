const axios = require('axios').default;

module.exports = () => {}

module.exports.putBotInfo = async (botInfo) => {
  await axios.put('https://website-test-ah.herokuapp.com/api/putbotinfo', botInfo);
}