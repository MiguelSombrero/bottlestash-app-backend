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
  abv: {
    type: Number,
    required: true,
    min: 0.0
  },
  ratings: Array
})

beerSchema.index({ brewery: 1, name: 1, abv: 1 }, { unique: true })

beerSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Beer = mongoose.model('Beer', beerSchema)

module.exports = Beer

