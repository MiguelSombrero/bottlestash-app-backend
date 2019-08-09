const breweriesRouter = require('express').Router()
const Brewery = require('../models/brewery')
const middleware = require('../utils/middleware')

breweriesRouter.get('/', async (req, res) => {
  const breweries = await Brewery.find({}).populate('beers', { ratings: 0, brewery: 0 })
  res.json(breweries.map(brewery => brewery.toJSON()))
})

breweriesRouter.get('/:name', async (req, res, next) => {
  try {
    const brewery = await Brewery.findOne({ name: req.params.name })
      .populate('beers', { ratings: 0, brewery: 0 })

    brewery === null
      ? res.status(204).end()
      : res.json(brewery.toJSON())

  } catch (exception) {
    next(exception)
  }
})

breweriesRouter.post('/', middleware.validateToken, async (req, res, next) => {
  const { name } = req.body

  const brewery = new Brewery({
    name, beers: []
  })

  try {
    const savedBrewery = await brewery.save()
    res.json(savedBrewery.toJSON())

  } catch (exception) {
    next(exception)
  }
})

module.exports = breweriesRouter