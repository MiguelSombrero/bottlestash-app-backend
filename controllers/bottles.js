const bottlesRouter = require('express').Router()
const Bottle = require('../models/bottle')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

bottlesRouter.get('/', async (req, res) => {
  const bottles = await Bottle.find({}).populate('beer', { ratings: 0 })
  res.json(bottles.map(bottle => bottle.toJSON()))
})

bottlesRouter.post('/', async (req, res, next) => {
  const { beerId, bottled, price, count, volume, expiration } = req.body

  const bottle = new Bottle({
    price,
    count,
    volume,
    bottled: new Date(bottled).toISOString(),
    expiration: new Date(expiration).toISOString(),
    beer: beerId
  })

  try {
    if (!req.token) {
      return res.status(401).json({
        error: 'token is missing'
      })
    }

    const decodedToken = jwt.verify(req.token, process.env.SECRET)

    if (!decodedToken.id) {
      return res.status(401).json({
        error: 'token is invalid'
      })
    }

    const user = await User.findById(decodedToken.id)
    const savedBottle = await bottle.save()

    user.stash = [...user.stash, savedBottle ]

    await user.save()
    res.json(savedBottle.toJSON())

  } catch (exception) {
    next(exception)
  }
})

module.exports = bottlesRouter