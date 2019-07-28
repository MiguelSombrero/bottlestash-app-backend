const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('stash')
  res.json(users.map(u => u.toJSON()))
})

usersRouter.post('/', async (req, res, next) => {
  try {
    const { password, username, name, email, hidden, country, city } = req.body
    const passwordHash = await bcrypt.hash(password, 10)

    const user = new User({
      username, passwordHash, name, email, hidden, country, city, stash: []
    })

    const savedUser = await user.save()
    res.json(savedUser.toJSON())

  } catch (exception) {
    next(exception)
  }
})

module.exports = usersRouter