'use strict';

console.log('hi');

const mongoose = require('mongoose');

const { DATABASE_URL } = require('../config');
const Word = require('../models/word');


const { words } = require('../db/data');

mongoose.connect(DATABASE_URL, { useNewUrlParser: true })
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Word.insertMany(words),
    ]);
  })
  .then(results => {
    console.info(results);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.log(err);
  });