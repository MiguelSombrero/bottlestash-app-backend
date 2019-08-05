/**
 * mongoose schema for Brewery. For the sake of simplicity containing only two attributes, name and beers.
 * schema can be extended for additional useful info, if needed
 */

const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const brewerySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  beers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Beer'
    }
  ]
})

brewerySchema.plugin(uniqueValidator)

brewerySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Brewery = mongoose.model('Brewery', brewerySchema)

module.exports = Brewery