'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullname: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  words: { type: Array, default: undefined },
  head: {type:Number, default:0}
});

userSchema.set('timestamps', true);

userSchema.set('toJSON', {
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
    delete result.password;
  }
});

userSchema.methods.validatePassword = function (incomingPassword) {
  return bcrypt.compare(incomingPassword, this.password);
};

userSchema.statics.hashPassword = function (incomingPassword) {
  const digest = bcrypt.hash(incomingPassword, 10);
  return digest;
};

module.exports = mongoose.model('User', userSchema);







// const newHash = 'kaleQueen9';
// function getHash(newHash) {
//   return bcrypt.hash(newHash, 10)
//     .then(res => console.log(res));
// }
// getHash(newHash);