const breweriesRouter = require('express').Router()
const Brewery = require('../models/brewery')
const jwt = require('jsonwebtoken')

breweriesRouter.get('/', async (req, res) => {
  const breweries = await Brewery.find({}).populate('beers', { ratings: 0, brewery: 0 })
  res.json(breweries.map(brewery => brewery.toJSON()))
})

breweriesRouter.post('/', async (req, res, next) => {
  const { name } = req.body

  const brewery = new Brewery({
    name, beers: []
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

    const savedBrewery = await brewery.save()
    res.json(savedBrewery.toJSON())

  } catch (exception) {
    next(exception)
  }
})

module.exports = breweriesRouter