const Beer = require('../models/beer')
const Bottle = require('../models/bottle')
const User = require('../models/user')
const Brewery = require('../models/brewery')
const Rating = require('../models/rating')
const bcrypt = require('bcrypt')

const initialUsers = [
  {
    _id: '5d4bc0527958a42219ca2034',
    username: 'Somero',
    name: 'Miika',
    email: 'miika.fi',
    hidden: false
  },
  {
    _id: '5d4bc0527958a42219ca2033',
    username: 'Luukkainen',
    name: 'Masa',
    email: 'masa.fi',
    hidden: true
  },
  {
    _id: '5d4bc0527958a42219ca2032',
    username: 'Rolli',
    name: 'Peikko',
    email: 'www.rolli-peikko.fi',
    hidden: false
  },
]

const newUser = {
  _id: '5d4bc0527958a42219ca2035',
  username: 'Uusihenkilo',
  password: 'salasana',
  name: 'Tytti',
  email: 'tytti.com'
}

const initialBreweries = [
  {
    _id: '5d4841d1f580955190e03e36',
    name: 'Sonnisaari'
  },
  {
    _id: '5d4841d1f580955190e03e33',
    name: 'Alesmith',
    beers: [
      '5d3da427fe4a36ce485c14c3',
      '5d3da448fe4a36ce485c14c4',
      '5d4841d1f580955190e03e33'
    ]
  },
  {
    _id: '5d4841d1f580955190e03e32',
    name: 'Ballast Point'
  },
  {
    _id: '5d4841d1f580955190e03e31',
    name: 'Mikkeller'
  },
  {
    _id: '5d4841d1f580955190e03e37',
    name: 'Westvleteren',
    beers: [
      '5d3da458fe4a36ce485c14c5'
    ]
  }
]

const initialBeers = [
  {
    _id: '5d3da427fe4a36ce485c14c3',
    brewery: '5d4841d1f580955190e03e33',
    name: 'IPA',
    abv: 7.6
  },
  {
    _id: '5d3da448fe4a36ce485c14c4',
    brewery: '5d4841d1f580955190e03e33',
    name: 'Speedway Stout',
    abv: 12.8
  },
  {
    _id: '5d3da458fe4a36ce485c14c5',
    brewery: '5d4841d1f580955190e03e37',
    name: 'XII',
    abv: 12.2
  },
  {
    _id: '5d3da464fe4a36ce485c14c6',
    brewery: '5d4841d1f580955190e03e33',
    name: 'IPA',
    abv: 6.2
  }
]

const newBeer = {
  _id: '5d3da464fe4a36ce485c14c7',
  breweryId: '5d4841d1f580955190e03e33',
  name: 'APA',
  abv: 5.6,
}

const initialBottles = [
  {
    _id: '9d3da464fe4a36ce485c14c3',
    count: 2,
    volume: 0.33,
    price: 4.90,
    bottled: new Date('03.05.2019').toISOString(),
    expiration: new Date('01.01.2020').toISOString(),
    beer: '5d3da458fe4a36ce485c14c5'
  },
  {
    _id: '8d3da464fe4a36ce485c14c3',
    count: 1,
    volume: 0.50,
    price: 5.89,
    bottled: new Date('03.12.2017').toISOString(),
    expiration: new Date('01.11.2022').toISOString(),
    beer: '5d3da448fe4a36ce485c14c4'
  },
  {
    _id: '7d3da464fe4a36ce485c14c3',
    count: 6,
    volume: 0.66,
    price: 9.90,
    bottled: new Date('05.31.2019').toISOString(),
    expiration: new Date('11.01.2023').toISOString(),
    beer: '5d3da458fe4a36ce485c14c5'
  },
  {
    _id: '6d3da464fe4a36ce485c14c3',
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
  beerId: '5d3da464fe4a36ce485c14c6',
  user: '5d4bc0527958a42219ca2034'
}

const initialRatings = [
  {
    _id: '9d3da464fe4a36ce485c14c9',
    aroma: 6,
    taste: 8,
    mouthfeel: 4,
    appearance: 4,
    overall: 17,
    added: new Date('08.29.2019').toISOString(),
    ageofbeer: 23,
    description: 'wery delicate taste, with hints of chocolate. Liked!',
    beer: '5d3da458fe4a36ce485c14c5',
    user: '5d4bc0527958a42219ca2034'
  },
  {
    _id: '8d3da464fe4a36ce485c14c9',
    aroma: 5,
    taste: 7,
    mouthfeel: 4,
    appearance: 3,
    overall: 14,
    added: new Date('02.01.2019').toISOString(),
    ageofbeer: 6,
    description: 'A bit alcoholy aftertaste. Light yellow body. Not too good.',
    beer: '5d3da448fe4a36ce485c14c4',
    user: '5d4bc0527958a42219ca2034'
  },
  {
    _id: '7d3da464fe4a36ce485c14c9',
    aroma: 8,
    taste: 8,
    mouthfeel: 5,
    appearance: 4,
    overall: 18,
    added: new Date('12.12.2018').toISOString(),
    ageofbeer: 34,
    description: 'Best Imperial Stout I have ever tasted!',
    beer: '5d3da448fe4a36ce485c14c4',
    user: '5d4bc0527958a42219ca2034'
  }
]

const newRating = {
  aroma: 9,
  taste: 9,
  mouthfeel: 5,
  appearance: 3,
  overall: 19,
  ageofbeer: 35,
  description: 'Very blanced and soft. Coffee and salty liqourice.',
  beerId: '5d3da448fe4a36ce485c14c4'
}

const initializeDatabase = async () => {
  await Beer.deleteMany({})
  await User.deleteMany({})
  await Brewery.deleteMany({})
  await Bottle.deleteMany({})
  await Rating.deleteMany({})

  const passwordHash = await bcrypt.hash('salainen', 10)

  const users = initialUsers
    .map(user => new User({ ...user, passwordHash }))

  const promiseArrayUsers = users.map(user => user.save())
  await Promise.all(promiseArrayUsers)

  const breweries = initialBreweries
    .map(brewery => new Brewery(brewery))

  const breweryPromiseArray = breweries.map(brewery => brewery.save())
  await Promise.all(breweryPromiseArray)

  const beers = initialBeers
    .map(beer => new Beer(beer))

  const promiseArray = beers.map(beer => beer.save())
  await Promise.all(promiseArray)

  const bottles = initialBottles
    .map(bottle => new Bottle({ ...bottle, user: '5d4bc0527958a42219ca2034' }))

  const promiseArrayBottle = bottles.map(bottle => bottle.save())
  await Promise.all(promiseArrayBottle)

  const ratings = initialRatings
    .map(rating => new Rating({ ...rating, user: '5d4bc0527958a42219ca2034' }))

  const promiseArrayRating = ratings.map(rating => rating.save())
  await Promise.all(promiseArrayRating)
}

const ratingsInDb = async () => {
  const ratings = await Rating.find({})
  return ratings.map(rating => rating.toJSON())
}
const beersInDb = async () => {
  const beers = await Beer.find({})
  return beers.map(beer => beer.toJSON())
}

const breweriesInDb = async () => {
  const breweries = await Brewery.find({})
  return breweries.map(brewery => brewery.toJSON())
}

const bottlesInDb = async () => {
  const bottles = await Bottle.find({})
  return bottles.map(bottle => bottle.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const stringOfLength = (length) => {
  return 'a'.repeat(length)
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
  usersInDb,
  initialBreweries,
  breweriesInDb,
  ratingsInDb,
  initialRatings,
  newRating,
  stringOfLength,
  initializeDatabase
}