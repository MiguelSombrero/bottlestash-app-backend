const beersRouter = require('express').Router()
const Beer = require('../models/beer')
const Brewery = require('../models/brewery')
const middleware = require('../utils/middleware')

const options = [
  { path: 'user', select: 'name' },
  { path: 'brewery', select: 'name' }
]

beersRouter.get('/', async (req, res) => {
  const beers = await Beer.find({}).populate(options)
  res.json(beers.map(beer => beer.toJSON()))
})

beersRouter.get('/:breweryId/:name/:abv', async (req, res, next) => {
  try {
    const beer = await Beer
      .findOne({ brewery: req.params.breweryId, name: req.params.name, abv: req.params.abv })
      .populate(options)

    beer === null
      ? res.status(204).end()
      : res.json(beer.toJSON())

  } catch (exception) {
    next(exception)
  }
})

beersRouter.post('/', middleware.validateToken, async (req, res, next) => {
  const { breweryId, name, abv } = req.body

  const beer = new Beer({
    brewery: breweryId, name, abv, ratings: []
  })

  try {
    const savedBeer = await beer.save()
    const brewery = await Brewery.findById(breweryId)
    brewery.beers = [...brewery.beers, savedBeer]
    await brewery.save()

    const populatedBeer = await Beer.populate(savedBeer, options)
    res.json(populatedBeer.toJSON())

  } catch (exception) {
    next(exception)
  }
})

module.exports = beersRouter