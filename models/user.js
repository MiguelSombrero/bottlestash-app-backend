const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 5
  },
  passwordHash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    minlength: 2
  },
  email: String,
  hidden: Boolean,
  country: String,
  city: String,
  stash: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bottle'
    }
  ]
})

userSchema.plugin(uniqueValidator)

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User