const bottlesRouter = require('express').Router()
const Bottle = require('../models/bottle')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')

bottlesRouter.get('/', async (req, res) => {
  const bottles = await Bottle.find({}).populate('beer', { ratings: 0 })
  res.json(bottles.map(bottle => bottle.toJSON()))
})

bottlesRouter.post('/', middleware.validateToken, async (req, res, next) => {
  const { beerId, bottled, price, count, volume, expiration } = req.body

  const bottle = new Bottle({
    price, count, volume, bottled, expiration, beer: beerId
  })

  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    const user = await User.findById(decodedToken.id)
    bottle.user = user._id
    const savedBottle = await bottle.save()
    user.stash = [...user.stash, savedBottle ]
    await user.save()

    res.json(savedBottle.toJSON())

  } catch (exception) {
    next(exception)
  }
})

bottlesRouter.put('/:id', middleware.validateToken, async (req, res, next) => {
  const { beer, bottled, price, count, volume, expiration, user } = req.body

  const bottle = {
    price, count, volume, bottled, expiration, beer, user
  }

  try {
    const updatedBottle = await Bottle
      .findByIdAndUpdate(req.params.id, bottle, { new: true })
      .populate('beer', { ratings: 0 })

    res.status(201).json(updatedBottle.toJSON())

  } catch (exception) {
    next(exception)
  }
})

bottlesRouter.delete('/:id', middleware.validateToken, async (req, res, next) => {
  try {
    await Bottle.findOneAndRemove(req.params.id)
    res.status(204).end()

  } catch (exception) {
    next(exception)
  }
})

module.exports = bottlesRouter