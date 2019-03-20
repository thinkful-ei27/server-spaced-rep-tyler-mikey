'use strict';

const { app } = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_DATABASE_URL } = require('../config');

const User = require('../models/user');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Users', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const fullname = 'Example User';

  before(function () {
    return mongoose.connect(TEST_DATABASE_URL, { useNewUrlParser: true, useCreateIndex: true })
      .then(() => User.deleteMany());
  });

  beforeEach(function () {
    return User.createIndexes();
  });

  afterEach(function () {
    return User.deleteMany();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('POST /api/users', function () {

    it('Should create a new user', function () {
      let res;
      return chai
        .request(app)
        .post('/api/users')
        .send({ username, password, fullname })
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'username', 'words','fullname', 'createdAt', 'updatedAt', 'head');
          expect(res.body.id).to.exist;
          expect(res.body.username).to.equal(username);
          expect(res.body.fullname).to.equal(fullname);
          return User.findOne({ username });
        })
        .then(user => {
          expect(user).to.exist;
          expect(user.id).to.equal(res.body.id);
          expect(user.fullname).to.equal(fullname);
          return user.validatePassword(password);
        })
        .then(isValid => {
          expect(isValid).to.be.true;
        });
    });

    it('Should reject users with missing username', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({ password, fullname })
        .then(_res => {
          res = _res;
          console.log('this is the res', res.body);
          expect(res).to.have.status(422);
          expect(res.body.message).to.equal('Missing field');
          expect(res.body.location).to.equal('username');
          expect(res.body.reason).to.equal('ValidationError');

        });

    });
    it('Should reject users with missing password', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({ username, fullname })
        .then(_res => {
          res = _res;
          expect(res).to.have.status(422);
          expect(res.body.message).to.equal('Missing field');
          expect(res.body.location).to.equal('password');
          expect(res.body.reason).to.equal('ValidationError');

        });
    });
    it('Should reject users with non-string username', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({ username: 5646546464564, password, fullname })
        .then(_res => {
          res = _res;
          expect(res).to.have.status(422);
          expect(res.body.message).to.equal('Incorrect field type: expected string');
          expect(res.body.location).to.equal('username');
          expect(res.body.reason).to.equal('ValidationError');

        });
    });

    it('Should reject users with non-string password', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({ username, password: 5646546464564, fullname })
        .then(_res => {
          res = _res;
          expect(res).to.have.status(422);
          expect(res.body.message).to.equal('Incorrect field type: expected string');
          expect(res.body.location).to.equal('password');
          expect(res.body.reason).to.equal('ValidationError');

        });
    });
    it('Should reject users with non-trimmed username', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({ username: ' exampleuser ', password, fullname })
        .then(_res => {
          res = _res;
          expect(res).to.have.status(422);
          expect(res.body.message).to.equal('Cannot start or end with whitespace');
          expect(res.body.location).to.equal('username');
          expect(res.body.reason).to.equal('ValidationError');

        });
    });
    it('Should reject users with non-trimmed password', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({ username, password: ' examplepassword ', fullname })
        .then(_res => {
          res = _res;
          expect(res).to.have.status(422);
          expect(res.body.message).to.equal('Cannot start or end with whitespace');
          expect(res.body.location).to.equal('password');
          expect(res.body.reason).to.equal('ValidationError');

        });
    });
    it('Should reject users with empty username', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({ username: '', password, fullname })
        .then(_res => {
          res = _res;
          expect(res).to.have.status(422);
          expect(res.body.message).to.equal('Must be at least 1 characters long');
          expect(res.body.location).to.equal('username');
          expect(res.body.reason).to.equal('ValidationError');

        });
    });
    it('Should reject users with password less than 8 characters', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({ username, password: '2short', fullname })
        .then(_res => {
          res = _res;
          expect(res).to.have.status(422);
          expect(res.body.message).to.equal('Must be at least 10 characters long');
          expect(res.body.location).to.equal('password');
          expect(res.body.reason).to.equal('ValidationError');

        });
    });
    it('Should reject users with password greater than 72 characters', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({
          username,
          password: new Array(73).fill('m').join(''),
          fullname
        })
        .then(_res => {
          res = _res;
          expect(res).to.have.status(422);
          expect(res.body.message).to.equal('Must be at most 72 characters long');
          expect(res.body.location).to.equal('password');
          expect(res.body.reason).to.equal('ValidationError');

        });
    });
    it('Should reject users with duplicate username', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({
          username,
          password,
          fullname
        })
        .then(() => {
          return chai.request(app)
            .post('/api/users')
            .send({
              username,
              password,
              fullname
            })
            .then((_res) => {
              res = _res;
              expect(res).to.have.status(400);
              expect(res.body.message).to.equal('The username already exists');

            });
        });


    });
    it('Should trim fullname', function () {
      let res;
      return chai.request(app)
        .post('/api/users')
        .send({
          username,
          password,
          fullname: ' whitespace fullname '
        })
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'username', 'fullname', 'words', 'createdAt', 'updatedAt', 'head');
          expect(res.body.id).to.exist;
          expect(res.body.username).to.equal(username);
          expect(res.body.fullname).to.equal('whitespace fullname');
        });
    });
  });

});
