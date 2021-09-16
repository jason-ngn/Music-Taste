const router = require('express').Router();
const pages = require('./pages');

router.use('/', pages);

module.exports = router;