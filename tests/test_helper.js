const Beer = require('../models/beer')
const Bottle = require('../models/bottle')
const User = require('../models/user')

const initialUsers = [
  {
    username: 'Somero',
    password: 'salainen',
    name: 'Miika',
    email: 'miika.fi'
  },
  {
    username: 'Luukkainen',
    password: 'salaisempi',
    name: 'Masa',
    email: 'masa.fi'
  },
]

const newUser = {
  username: 'Uusihenkilo',
  password: 'salasana',
  name: 'Tytti',
  email: 'tytti.com'
}

const initialBeers = [
  {
    brewery: 'Alesmith',
    name: 'IPA',
    abv: 7.6
  },
  {
    brewery: 'Alesmith',
    name: 'Speedway Stout',
    abv: 12.8
  },
  {
    brewery: 'Westvleteren',
    name: 'XII',
    abv: 12.2
  },
  {
    brewery: 'Sonnisaari',
    name: 'IPA',
    abv: 6.2
  }
]

const newBeer = {
  brewery: 'Olarin Panimo',
  name: 'APA',
  abv: 5.6,
}

const beersInDb = async () => {
  const beers = await Beer.find({})
  return beers.map(beer => beer.toJSON())
}

const bottlesInDb = async () => {
  const bottles = await Bottle.find({})
  return bottles.map(bottle => bottle.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialUsers,
  newUser,
  newBeer,
  initialBeers,
  beersInDb,
  bottlesInDb,
  usersInDb
}