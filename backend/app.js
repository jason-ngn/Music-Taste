require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3002;
const mongoose = require('mongoose');
const routes = require('./routes/index');
const pages = require('./pages/index');
const path = require('path');
const ejs = require('ejs');

module.exports = async (client) => {
  app.use(express.json())
  app.use(express.static(path.join(__dirname, '../frontend')));
  app.use(express.static(path.join(__dirname, '../views')));
  app.set('view engine', 'ejs');

  app.use('/api', routes);
  app.use('/', pages);

  app.listen(port, () => console.log(`Listening on port: ${port}`));
};
