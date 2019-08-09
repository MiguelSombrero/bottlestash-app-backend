const Rating = require('../models/rating')
const ratingsRouter = require('express').Router()
const User = require('../models/user')
const Beer = require('../models/beer')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')

ratingsRouter.get('/', async (req, res) => {
  const ratings = await Rating.find({}).populate('beer', { ratings: 0 })
  res.json(ratings.map(rating => rating.toJSON()))
})

ratingsRouter.post('/', middleware.validateToken, async (req, res, next) => {
  const { beerId, aroma, taste, mouthfeel, appearance, overall, description, rated, ageofbeer } = req.body

  const rating = new Rating({
    aroma, taste, mouthfeel, appearance, overall, description, rated, ageofbeer, beer: beerId
  })

  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    const user = await User.findById(decodedToken.id)
    const beer = await Beer.findById(beerId)

    rating.user = user._id
    const savedRating = await rating.save()
    user.ratings = [...user.ratings, savedRating ]
    beer.ratings = [...beer.ratings, savedRating ]
    await user.save()

    res.json(savedRating.toJSON())

  } catch (exception) {
    next(exception)
  }
})

module.exports = ratingsRouter