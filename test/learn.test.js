'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const express = require('express');
const { app } = require('../index');
const sinon = require('sinon');


const { words, users } = require('../db/data');
const User = require('../models/user');
const Word = require('../models/word');
const { TEST_DATABASE_URL, JWT_SECRET } = require('../config');
const { dbConnect, dbDisconnect } = require('../db-mongoose');
const jwt = require('jsonwebtoken');

// const {dbConnect, dbDisconnect} = require('../db-knex');

// Set NODE_ENV to `test` to disable http layer logs
// You can do this in the command line, but this is cross-platform
process.env.NODE_ENV = 'test';

// Clear the console before each run
process.stdout.write('\x1Bc\n');

const expect = chai.expect;
chai.use(chaiHttp);
const sandbox = sinon.createSandbox();

describe('German API - learn', function () {

  before(function () {
    return dbConnect(TEST_DATABASE_URL, { useNewUrlParser: true, useCreateIndex: true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  let user;
  let token;
  beforeEach(function () {
    return Word.insertMany(words)
      .then(function () {
        let words = Word.find();
        return words;
      })
      .then(words => {
        const wordsList = words.map(word => {
          let item = {};
          item.germanWord = word.germanWord;
          item.englishWord = word.englishWord;
          item.Mvalue = word.Mvalue;
          return item;
        });
        const newUsers = users.map(user => {
          return Object.assign({}, user, {
            words: [...wordsList]
          });
        });
        return User.insertMany(newUsers)
          .then(([users]) => {
            user = users;
            token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
          });
      });

  });
  afterEach(function () {
    sandbox.restore();
    return Promise.all([
      Word.deleteMany(),
      User.deleteMany(),
    ]);
  });

  after(function () {
    return dbDisconnect();
  });

  describe('GET /api/learn', function () {
    it('should return the first word pair', function () {
      return Promise.all([
        User.findOne({ _id: user.id }),
        chai.request(app).get('/api/learn')
          .set('Authorization', `Bearer ${token}`)
      ])
        .then(([user, res]) => {
          const word = user.words[0];
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(word.germanWord).to.equal(res.body.germanWord);
        });
    });
  });
  describe('POST /api/learn', function () {
    it('should handle repositioning in the list', function () {
      return Promise.all([
      ]);
    });
  });

});