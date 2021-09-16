const router = require('express').Router();

let botInfoCache;

router.put('/putbotinfo', async (req, res) => {
  const botInfo = req.body;

  botInfoCache = botInfo;
});

router.get('/getbotinfo', async (req, res) => {
  return botInfoCache ? res.send(botInfoCache) : res.send('No data in DB');
})

module.exports = router;