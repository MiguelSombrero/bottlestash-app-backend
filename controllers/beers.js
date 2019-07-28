const beersRouter = require('express').Router()
const Beer = require('../models/beer')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = req => {
  const authorization = req.get('authorization')

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

beersRouter.get('/', async (req, res) => {
  const users = await Beer.find({})
  res.json(users.map(u => u.toJSON()))
})

beersRouter.post('/', async (req, res, next) => {
  const { brewery, name, alcohol, bottled, price, count, volume, expiration } = req.body
  const token = getTokenFrom(req)

  const beer = new Beer({
    brewery, name, alcohol, ratings: []
  })

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return res.status(401).json({
        error: 'token missing or invalid'
      })
    }

    const user = await User.findById(decodedToken.id)
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