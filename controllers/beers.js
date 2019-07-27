const beersRouter = require('express').Router()
const Beer = require('../models/beer')
const User = require('../models/user')

beersRouter.get('/', async (req, res) => {
  const users = await Beer.find({})
  res.json(users.map(u => u.toJSON()))
})

beersRouter.post('/', async (req, res, next) => {
  const { userId, brewery, name, alcohol, bottled, price, count, volume, expiration } = req.body
  const user = await User.findById(userId)

  const beer = new Beer({
    brewery, name, alcohol, ratings: []
  })

  try {
    const savedBeer = await beer.save()

    user.stash = [...user.stash,
      {
        beer: savedBeer._id,
        count,
        bottled,
        price,
        volume,
        expiration
      }
    ]

    await user.save()
    res.json(savedBeer.toJSON())

  } catch (exception) {
    next(exception)
  }
})

module.exports = beersRouter