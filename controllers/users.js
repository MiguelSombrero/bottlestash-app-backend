const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Bottle = require('../models/bottle')
const Rating = require('../models/rating')
const Beer = require('../models/beer')
const Picture = require('../models/picture')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')

const options = [
  { path: 'stash',
    populate: { path: 'beer', select: 'brewery name abv',
      populate: { path: 'brewery', select: 'name' } }
  }
]

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate(options)
  res.json(users.map(u => u.toJSON()))
})

usersRouter.get('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate(options)

    user === null
      ? res.status(204).end()
      : res.json(user.toJSON())

  } catch (exception) {
    next(exception)
  }
})

usersRouter.post('/', async (req, res, next) => {
  const { password, username, name, email, hidden, country, city } = req.body

  if (password.length < 5 || password.length > 20) {
    return res.status(401).json({
      error: 'password must be between 5-20 characters'
    })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = new User({
    username, passwordHash, name, email, hidden, country, city, stash: [], ratings: []
  })

  try {
    const savedUser = await user.save()
    res.json(savedUser.toJSON())

  } catch (exception) {
    next(exception)
  }
})

usersRouter.put('/:id', middleware.validateToken, async (req, res, next) => {
  const { name, email, hidden, country, city, pictureId } = req.body

  const updatedUser = {
    name, email, hidden, country, city, picture: pictureId
  }

  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)

    if (decodedToken.id.toString() !== req.params.id.toString()) {
      return res.status(401).send({ error: 'no authorization to update user' })
    }

    const savedUser = await User
      .findByIdAndUpdate(req.params.id, updatedUser, { new: true })
      .populate(options)

    res.status(201).json(savedUser.toJSON())

  } catch (exception) {
    next(exception)
  }
})

usersRouter.delete('/:id', middleware.validateToken, async (req, res, next) => {
  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).send({ error: 'no such user' })
    }

    if (decodedToken.id.toString() !== req.params.id.toString()) {
      return res.status(401).send({ error: 'no authorization to delete user' })
    }

    await Bottle.deleteMany({ user: user._id })
    await Rating.deleteMany({ user: user._id })
    await Picture.deleteMany({ user: user._id })

    await Beer.updateMany(
      { ratings: { $in: [ user._id ] } },
      { $pull: { ratings: { user: user._id } } },
      { multi: true }
    )

    await user.deleteOne()
    res.status(204).end()

  } catch (exception) {
    next(exception)
  }
})

module.exports = usersRouter