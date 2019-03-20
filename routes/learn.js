'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.get('/', (req, res, next) => {
  const userId = req.user.id;
  return User.findOne({ _id: userId })
    .then((user) => {
      let index = user.head;
      const word = user.words[index];
      res.json(word);
    })
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  const userId = req.user.id;
  const { germanWord, correct } = req.body;

  if (typeof correct !== 'boolean') {
    const err = new Error('Did not include result boolean');
    err.status = 400;
    return next(err);
  }

  return User.findOne({ _id: userId })
    .then(user => {
      let wordList = user.words;
      let head = user.head;
      console.log(wordList);

      if (wordList[head].germanWord !== germanWord) {
        const err = new Error('User word does not match current DB word');
        err.status = 400;
        return next(err);
      }

      if (correct) {
        wordList[head].Mvalue *= 2;
      } else { wordList[head].Mvalue = 1; 
      }

      let next = wordList[head].pointer;
      console.log(`this is next ${next}`);
      if (wordList[head].Mvalue > 9) {
        let current = wordList[head];
        while (current.pointer) {
          let next = wordList[head].pointer;
          current = wordList[next];
        }
        wordList[head].pointer = null;
        current.pointer = head;
      } else {
        let counter = 1;
        let current = head;
        while (counter <= wordList[head].Mvalue) {
          current = wordList[current].pointer;
          counter++;
        }
        wordList[head].pointer = wordList[current].pointer;
        wordList[current].pointer = head;
      }
      
      head = next;
      
      return User.findOneAndUpdate({ _id: userId }, { $set: { words: wordList, head: head } })
        .then(() => {
          res.sendStatus(204);
        })
        .catch(err => next(err));
    });
});

module.exports = router;