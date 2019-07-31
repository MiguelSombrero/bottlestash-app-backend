const Beer = require('../models/beer')
const Bottle = require('../models/bottle')
const User = require('../models/user')

const initialUsers = [
  {
    username: 'Somero',
    passwordHash: 'salainen',
    name: 'Miika',
    email: 'miika.fi'
  },
  {
    username: 'Luukkainen',
    passwordHash: 'salaisempi',
    name: 'Masa',
    email: 'masa.fi'
  },
  {
    username: 'Rölli',
    passwordHash: 'peikko',
    name: 'Peikko',
    email: 'www.rolli-peikko.fi'
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
    _id: '5d3da427fe4a36ce485c14c3',
    brewery: 'Alesmith',
    name: 'IPA',
    abv: 7.6
  },
  {
    _id: '5d3da448fe4a36ce485c14c4',
    brewery: 'Alesmith',
    name: 'Speedway Stout',
    abv: 12.8
  },
  {
    _id: '5d3da458fe4a36ce485c14c5',
    brewery: 'Westvleteren',
    name: 'XII',
    abv: 12.2
  },
  {
    _id: '5d3da464fe4a36ce485c14c6',
    brewery: 'Sonnisaari',
    name: 'IPA',
    abv: 6.2
  }
]

const newBeer = {
  _id: '5d3da464fe4a36ce485c14c7',
  brewery: 'Olarin Panimo',
  name: 'APA',
  abv: 5.6,
}

const initialBottles = [
  {
    count: 2,
    volume: 0.33,
    price: 4.90,
    bottled: new Date('03.05.2019').toISOString(),
    expiration: new Date('01.01.2020').toISOString(),
    beer: '5d3da427fe4a36ce485c14c3'
  },
  {
    count: 1,
    volume: 0.50,
    price: 5.89,
    bottled: new Date('03.12.2017').toISOString(),
    expiration: new Date('01.11.2022').toISOString(),
    beer: '5d3da448fe4a36ce485c14c4'
  },
  {
    count: 6,
    volume: 0.66,
    price: 9.90,
    bottled: new Date('05.31.2019').toISOString(),
    expiration: new Date('11.01.2023').toISOString(),
    beer: '5d3da458fe4a36ce485c14c5'
  },
  {
    count: 1,
    volume: 0.33,
    price: 7.90,
    bottled: new Date('07.30.2019').toISOString(),
    expiration: new Date('01.21.2021').toISOString(),
    beer: '5d3da464fe4a36ce485c14c6'
  }
]

const newBottle = {
  count: 3,
  volume: 0.75,
  price: 19.90,
  bottled: new Date('08.29.2019').toISOString(),
  expiration: new Date('11.02.2026').toISOString(),
  beerId: '5d3da464fe4a36ce485c14c6'
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
  initialBottles,
  newBottle,
  beersInDb,
  bottlesInDb,
  usersInDb
}