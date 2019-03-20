'use strict';

console.log('hi');

const mongoose = require('mongoose');

const { DATABASE_URL } = require('../config');
const Word = require('../models/word');
const User = require('../models/user');


const { words, users } = require('../db/data');

mongoose.connect(DATABASE_URL, { useNewUrlParser: true, useCreateIndex: true })
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Word.insertMany(words);
  })
  .then(() => Word.find())
  .then(words => {
    const wordsList = words.map(word => {
      let item = {};
      item.germanWord = word.germanWord;
      item.englishWord = word.englishWord;
      item.Mvalue = word.Mvalue;
      item.pointer = word.pointer;
      return item;
    });
    const newUsers = users.map(user => {
      return Object.assign({}, user, {
        words: [...wordsList]
      });
    });
    return User.insertMany(newUsers);
  })
  .then(results => {
    console.info(results);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.log(err);
  });