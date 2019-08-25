const picturesRouter = require('express').Router()
const Picture = require('../models/picture')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')
const multer = require('multer')
const upload = multer()

picturesRouter.get('/', async (req, res) => {
  const pictures = await Picture.find({})
  res.json(pictures.map(p => p.toJSON()))
})

picturesRouter.get('/:id', async (req, res) => {
  const picture = await Picture.findById(req.params.id)
  res.contentType(picture.contentType)
  res.send(picture.data)
})

picturesRouter.post('/', upload.single('picture'), middleware.validateToken, async (req, res, next) => {
  const { buffer, mimetype, size, originalname } = req.file

  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    const user = await User.findById(decodedToken.id)

    const picture = new Picture({
      filename: originalname,
      content: buffer,
      contentType: mimetype,
      size,
      user: user._id
    })

    const savedPicture = await picture.save()
    res.json(savedPicture.toJSON())

  } catch (exception) {
    next(exception)
  }
})

module.exports = picturesRouter