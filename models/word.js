const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  germanWord: { type: String, required: true },
  englishWord: { type: String, required: true },
  Mvalue: {type: Number, required: true},
  pointer: {type: Number}
});
// Add `createdAt` and `updatedAt` fields
wordSchema.set('timestamps', true);


wordSchema.set('toJSON', {
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.__v;
  }
});
module.exports = mongoose.model('Word', wordSchema);

