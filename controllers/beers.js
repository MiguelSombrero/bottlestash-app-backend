const beersRouter = require('express').Router()
const Beer = require('../models/beer')
const jwt = require('jsonwebtoken')

beersRouter.get('/', async (req, res) => {
  const beers = await Beer.find({})
  res.json(beers.map(beer => beer.toJSON()))
})

beersRouter.post('/', async (req, res, next) => {
  const { brewery, name, abv } = req.body

  const beer = new Beer({
    brewery, name, abv, ratings: []
  })

  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)

    if (!req.token || !decodedToken.id) {
      return res.status(401).json({
        error: 'token missing or invalid'
      })
    }

    const savedBeer = await beer.save()
    res.json(savedBeer.toJSON())

  } catch (exception) {
    next(exception)
  }
})

module.exports = beersRouter