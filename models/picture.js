const mongoose = require('mongoose')

const pictureSchema = new mongoose.Schema({
  filename: String,
  content: {
    type: Buffer,
    required: true
  },
  contentType: {
    type: String,
    required: true,
    match: /image\/*/
  },
  size: {
    type: Number,
    required: true,
    max: 16000000
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

pictureSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Picture = mongoose.model('Picture', pictureSchema)

module.exports = Picture