const router = require('express').Router();
const path = require('path');
const landing = path.join(__dirname, '../../frontend/pages/Landing/landing.html');
const staff = path.join(__dirname, '../../frontend/pages/Staff/staff.html');
const { getCommands } = require('../../utils/get-commands');
require('ejs');

router.get('/', async (req, res) => {
  res.redirect('http://localhost:3003/main');
});

router.get('/main', async (req, res) => {
  res.sendFile(landing);
});

router.get('/commands', async (req, res) => {
  const commands = await getCommands().then(command => {
    return command;
  });

  res.render('commands', {
    commands,
  })
});

router.get('/staff', async (req, res) => {
  res.sendFile(staff);
});

module.exports = router;