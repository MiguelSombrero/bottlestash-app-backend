const mongoose = require('mongoose')

const ratingSchema = new mongoose.Schema({
  aroma: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  taste: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  mouthfeel: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  appearance: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  overall: {
    type: Number,
    required: true,
    min: 0,
    max: 20
  },
  rated: {
    type: Date,
    required: true
  },
  ageofbeer: {
    type: Number,
    min: 0,
    max: 360
  },
  description: {
    type: String,
    maxlength: 1000
  },
  beer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beer',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

ratingSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Rating = mongoose.model('Rating', ratingSchema)

module.exports = Rating
