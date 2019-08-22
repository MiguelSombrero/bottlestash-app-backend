const bottlesRouter = require('express').Router()
const Bottle = require('../models/bottle')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')

const options = [
  { path: 'user', select: 'name hidden' },
  { path: 'beer', select: 'brewery name abv',
    populate: { path: 'brewery', select: 'name' } }
]

bottlesRouter.get('/', async (req, res) => {
  const bottles = await Bottle.find({}).populate(options)

  res.json(bottles.map(bottle => bottle.toJSON()))
})

bottlesRouter.post('/', middleware.validateToken, async (req, res, next) => {
  const { beerId, bottled, price, count, volume, expiration } = req.body

  const bottle = new Bottle({
    price, count, volume, beer: beerId, added: new Date(), bottled, expiration
  })

  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    const user = await User.findById(decodedToken.id)
    bottle.user = user._id
    const savedBottle = await bottle.save()
    user.stash = [...user.stash, savedBottle ]
    await user.save()

    const populatedBottle = await Bottle.populate(savedBottle, options)
    res.json(populatedBottle.toJSON())

  } catch (exception) {
    next(exception)
  }
})

bottlesRouter.put('/:id', middleware.validateToken, async (req, res, next) => {
  const { beer, user, bottled, price, count, volume, expiration, added } = req.body

  const newBottle = {
    price, count, volume, bottled, expiration, beer, user, added
  }

  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)

    if (decodedToken.id.toString() !== user.toString()) {
      return res.status(401).send({ error: 'no authorization to update bottle' })
    }

    const updatedBottle = await Bottle
      .findByIdAndUpdate(req.params.id, newBottle, { new: true })
      .populate(options)

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
      return res.status(404).send({ error: 'no such bottle' })
    }

    if (decodedToken.id.toString() !== bottle.user.toString()) {
      return res.status(401).send({ error: 'no authorization to delete bottle' })
    }

    await bottle.deleteOne()
    res.status(204).end()

  } catch (exception) {
    next(exception)
  }
})

module.exports = bottlesRouter