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
  }
})

bottleSchema.post('remove', async (bottle) => {
  await User.updateOne(
    {},
    { $pull: { stash: bottle._id } },
    { multi: true }
  )
})

/**
bottleSchema.post('save', async (bottle) => {
  await bottle.populate({ path: 'user', select: 'name hidden' })
    .populate({ path: 'beer', select: 'brewery name abv',
      populate: { path: 'brewery', select: 'name' } }
    )
})
 */

bottleSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Bottle = mongoose.model('Bottle', bottleSchema)

module.exports = Bottle
