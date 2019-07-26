const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (req, res, next) => {
  try {
    const body = req.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      passwordHash,
      name: body.name,
      email: body.email,
      stash: {
        private: body.private,
        beers: []
      }
    })

    const savedUser = await user.save()
    res.json(savedUser)

  } catch (exception) {
    next(exception)
  }
})

module.exports = usersRouter