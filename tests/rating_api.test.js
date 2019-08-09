const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Beer = require('../models/beer')
const User = require('../models/user')
const Bottle = require('../models/bottle')
const Rating = require('../models/rating')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

let login = null

beforeEach(async () => {
  await Beer.deleteMany({})
  await User.deleteMany({})
  await Bottle.deleteMany({})
  await Rating.deleteMany({})

  const passwordHash = await bcrypt.hash('salainen', 10)
  const user = new User({ username: 'Somero', passwordHash, name: 'Miika' })
  await user.save()

  login = await api
    .post('/api/login')
    .send({ username: 'Somero', password: 'salainen' })

  const beers = helper.initialBeers
    .map(beer => new Beer(beer))

  const promiseArrayBeer = beers.map(beer => beer.save())
  await Promise.all(promiseArrayBeer)

  const bottles = helper.initialBottles
    .map(bottle => new Bottle(bottle))

  const promiseArrayBottle = bottles.map(bottle => bottle.save())
  await Promise.all(promiseArrayBottle)

  const ratings = helper.initialRatings
    .map(rating => new Rating(rating))

  const promiseArrayRating = ratings.map(rating => rating.save())
  await Promise.all(promiseArrayRating)
})

describe('tests covering GETting ratings from database', () => {
  test('ratings are returned as json', async () => {
    await api
      .get('/api/ratings')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all ratings are returned', async () => {
    const ratingsAtStart = await helper.ratingsInDb()
    expect(ratingsAtStart.length).toBe(helper.initialRatings.length)
  })

  test('a specific rating is in the database', async () => {
    const ratingsAtStart = await helper.ratingsInDb()
    const contents = ratingsAtStart.map(rating => rating.description.toString())
    expect(contents).toContain('')
  })

  test('id field is defined', async () => {
    const res = await api
      .get('/api/ratings')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body[0].id).toBeDefined()
  })
})


afterAll(() => {
  mongoose.connection.close()
})