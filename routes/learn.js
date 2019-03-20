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
      if (wordList[0].germanWord !== germanWord) {
        const err = new Error('User word does not match current DB word');
        err.status = 400;
        return next(err);
      }

      let testedWord = {
        germanWord: wordList[0].germanWord,
        englishWord: wordList[0].englishWord
      };

      if (correct) {
        let newMvalue = wordList[0].Mvalue + 1;
        testedWord.Mvalue = newMvalue;
      } else testedWord.Mvalue = 1;

      const newWordList = [...wordList.slice(1), testedWord];

      return User.findOneAndUpdate({ _id: userId }, { $set: { words: newWordList } })
        .then(() => {
          res.sendStatus(204);
        })
        .catch(err => next(err));
    });
});

module.exports = router;