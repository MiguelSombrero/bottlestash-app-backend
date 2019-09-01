const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    maxlength: 20
  },
  passwordHash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 20
  },
  email: {
    type:String,
    unique: true,
    minlength: 1,
    maxlength: 50
  },
  hidden: Boolean,
  country: {
    type: String,
    maxlength: 50
  },
  city: {
    type: String,
    maxlength: 50
  },
  picture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Picture'
  },
  stash: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bottle'
    }
  ],
  ratings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rating'
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