const router = require('express').Router();
const test = require('./test');
const botinfo = require('./botinfo');
const commands = require('./commands');

router.use('/test', test);
router.use('/', botinfo);
router.use('/', commands);

module.exports = router;