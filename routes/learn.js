'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.get('/', (req, res, next) => {
  const userId = req.user.id;
  //get user document
  return User.findOne({ _id: userId })
    .then((user) => {
    //  use head value to return word at the address indicated by head
      let index = user.head;
      const word = user.words[index];
      res.json(word);
    })
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  const userId = req.user.id;
  const { germanWord, correct } = req.body;

  // Check if client sends response boolean
  if (typeof correct !== 'boolean') {
    const err = new Error('Did not include result boolean');
    err.status = 400;
    return next(err);
  }

  // get list head , the word client just answered
  return User.findOne({ _id: userId })
    .then(user => {
      let wordList = user.words;
      let head = user.head;

      // make sure client is answered word that is the list head
      if (wordList[head].germanWord !== germanWord) {
        const err = new Error('User word does not match current DB word');
        err.status = 400;
        return next(err);
      }

      // handle Memory score
      if (correct) {
        wordList[head].Mvalue *= 2;
      } else {
        wordList[head].Mvalue = 1;
      }

      // store list heads pointer 
      let next = wordList[head].pointer;

      // checks for M value that is larger than list length
      if (wordList[head].Mvalue > 9) {
        let currentWord = wordList[head];

        // finds end of list
        while (currentWord.pointer !== null) {
          let next = currentWord.pointer;
          currentWord = wordList[next];
        }
        //  list end now second to last, list hed put at end
        currentWord.pointer = head;
        wordList[head].pointer = null;
      }
      //  creates counter to find position in the list that matches the mValue
      else {
        let counter = 1;
        let currentAddress = head;
        while (counter <= wordList[head].Mvalue) {
          currentAddress = wordList[currentAddress].pointer;
          counter++;
        }
        // list heads new address now in a place in the list according to Mvalue
        wordList[head].pointer = wordList[currentAddress].pointer;
        wordList[currentAddress].pointer = head;
      }

      //  sets new head to the next value ( heads pointer), stored above.
      head = next;

      //  update DB
      return User.findOneAndUpdate({ _id: userId }, { $set: { words: wordList, head: head } })
        .then(() => {
          res.sendStatus(204);
        })
        .catch(err => next(err));
    });
});

module.exports = router;