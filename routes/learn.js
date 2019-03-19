const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.get('/', (req, res, next) => {
  const userId = req.user.id;
  return User.findOne({ _id: userId })
    .then((user) => {
      const word = user.words[0];
      res.json(word);
    })
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  

});

module.exports = router;