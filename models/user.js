const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const Bottle = require('./bottle')
const Rating = require('./rating')
const Beer = require('./beer')

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
    required: true
  },
  email: {
    type:String,
    unique: true
  },
  hidden: Boolean,
  country: String,
  city: String,
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

userSchema.pre('deleteOne', async (user) => {
  await Bottle.deleteMany({ user: user._id })
  await Rating.deleteMany({ user: user._id })
  await Beer.updateMany( {},
    { $pull: { ratings: { user: user._id } } },
    { multi: true }
  )
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