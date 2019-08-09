const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate({ path: 'stash', select: 'price count volume bottled expiration beer',
    populate: { path: 'beer', select: 'brewery name abv',
      populate: { path: 'brewery', select: 'name' } }
  })

  res.json(users.map(u => u.toJSON()))
})

usersRouter.post('/', async (req, res, next) => {
  const { password, username, name, email, hidden, country, city } = req.body

  if (password.length < 5) {
    return res.status(401).json({
      error: 'password too short'
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

module.exports = usersRouter