const mongoose = require('mongoose')

const bottleSchema = new mongoose.Schema({
  count: {
    type: Number,
    required: true,
    min: 0
  },
  volume: {
    type: Number,
    required: true,
    min: 0.0
  },
  price: {
    type: Number,
    min: 0.0
  },
  bottled: Date,
  expiration: Date,
  beer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beer',
    required: true
  }
})

bottleSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Bottle = mongoose.model('Bottle', bottleSchema)

module.exports = Bottle
