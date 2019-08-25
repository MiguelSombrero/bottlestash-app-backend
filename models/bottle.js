const mongoose = require('mongoose')
const User = require('./user')

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
  added: Date,
  beer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beer',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  picture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Picture'
  }
})

bottleSchema.post('remove', async (bottle) => {
  await User.updateOne(
    {},
    { $pull: { stash: bottle._id } },
    { multi: true }
  )
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
