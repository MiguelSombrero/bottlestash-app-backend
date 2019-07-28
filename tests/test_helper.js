const Beer = require('../models/beer')
const Bottle = require('../models/bottle')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const initialUser = async () => {
  const passwordHash = await bcrypt.hash('salainen', 10)

  return (
    {
      username: 'Somero',
      passwordHash,
      name: 'Miika'
    }
  )
}

const initialBeers = [
  {
    brewery: 'Alesmith',
    name: 'IPA',
    abv: 7.6,
    ratings: []
  },
  {
    brewery: 'Alesmith',
    name: 'Speedway Stout',
    abv: 12.8,
    ratings: []
  },
  {
    brewery: 'Westvleteren',
    name: 'XII',
    abv: 12.2,
    ratings: []
  },
  {
    brewery: 'Sonnisaari',
    name: 'IPA',
    abv: 6.2,
    ratings: []
  }
]

const beersInDb = async () => {
  const beers = await Beer.find({})
  return beers.map(beer => beer.toJSON())
}

const bottlesInDb = async () => {
  const bottles = await Bottle.find({})
  return bottles.map(bottle => bottle.toJSON())
}

module.exports = {
  initialUser, initialBeers, beersInDb, bottlesInDb
}