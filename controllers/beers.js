const beersRouter = require('express').Router()
const Beer = require('../models/beer')
const Brewery = require('../models/brewery')
const jwt = require('jsonwebtoken')

beersRouter.get('/', async (req, res) => {
  const beers = await Beer.find({})
  res.json(beers.map(beer => beer.toJSON()))
})

beersRouter.get('/:breweryId/:name/:abv', async (req, res, next) => {
  try {
    const beer = await Beer.findOne({ brewery: req.params.breweryId, name: req.params.name, abv: req.params.abv })

    beer === null
      ? res.status(204).end()
      : res.json(beer.toJSON())

  } catch (exception) {
    next(exception)
  }
})

beersRouter.post('/', async (req, res, next) => {
  const { breweryId, name, abv } = req.body

  const beer = new Beer({
    brewery: breweryId, name, abv, ratings: []
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

    const savedBeer = await beer.save()
    const brewery = await Brewery.findById(breweryId)
    brewery.beers = [...brewery.beers, savedBeer]
    await brewery.save()
    res.json(savedBeer.toJSON())

  } catch (exception) {
    next(exception)
  }
})

module.exports = beersRouter