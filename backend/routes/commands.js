const { getCommands } = require('../../utils/get-commands');
const router = require('express').Router();

router.get('/commands', async (req, res) => {
  const commands = await getCommands().then(command => {
    return command;
  });

  return res.send(commands);
})

module.exports = router;