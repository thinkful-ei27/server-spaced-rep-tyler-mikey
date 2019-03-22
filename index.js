'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');


const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const learnRouter = require('./routes/learn');
const scoreRouter = require('./routes/score');


passport.use(localStrategy);
passport.use(jwtStrategy);

const app = express();

app.use(express.json());


app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors(
    {
      origin: CLIENT_ORIGIN || 'https://localhost:3000'
    }
  )
);

app.use('/api', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/learn', learnRouter);
app.use('/api/score', scoreRouter);

// Custom 404 Not Found route handler
app.use((req, res, next) => {

  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom Error Handler
app.use((err, req, res, next) => {
  // console.log(err);
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
