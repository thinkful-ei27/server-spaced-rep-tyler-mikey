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
      const words = user.words;
      const wordsPlusScores = words.map(word => {
        let parsedObj = {};
        parsedObj.germanWord = word.germanWord;
        parsedObj.Mvalue= word.Mvalue;
        return parsedObj;
      });
      res.json(wordsPlusScores);
    })
    .catch(err => next(err));
});

module.exports = router;