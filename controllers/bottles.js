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
  const { beer, user, bottled, price, count, volume, expiration } = req.body

  const newBottle = {
    price, count, volume, bottled, expiration, beer, user
  }

  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)

    if (decodedToken.id.toString() !== user.toString()) {
      res.status(401).send({ error: 'no authorization to update bottle' })
    }

    const updatedBottle = await Bottle.findByIdAndUpdate(req.params.id, newBottle, { new: true })
      .populate('beer', { ratings: 0 })

    res.status(201).json(updatedBottle.toJSON())

  } catch (exception) {
    next(exception)
  }
})

bottlesRouter.delete('/:id', middleware.validateToken, async (req, res, next) => {
  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    const bottle = await Bottle.findById(req.params.id)

    if (!bottle) {
      res.status(404).send({ error: 'no such bottle' })
    }

    if (decodedToken.id.toString() !== bottle.user.toString()) {
      res.status(401).send({ error: 'no authorization to delete bottle' })
    }

    await bottle.remove()
    res.status(204).end()

  } catch (exception) {
    next(exception)
  }
})

module.exports = bottlesRouter