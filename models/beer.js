const mongoose = require('mongoose')

const beerSchema = new mongoose.Schema({
  brewery: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  alcohol: {
    type: Number,
    required: true
  },
  ratings: Array
})

beerSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const Beer = mongoose.model('Beer', beerSchema)

module.exports = Beer

