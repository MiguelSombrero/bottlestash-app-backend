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
    expect(contents).toContain('A bit alcoholy aftertaste. Light yellow body. Not too good.')
  })

  test('id field is defined', async () => {
    const res = await api
      .get('/api/ratings')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body[0].id).toBeDefined()
  })
})

describe('tests covering POSTing ratings in database', () => {
  test('a valid rating can be added', async () => {
    await api
      .post('/api/ratings')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(helper.newRating)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const ratingsAtEnd = await helper.ratingsInDb()
    expect(ratingsAtEnd.length).toBe(helper.initialRatings.length + 1)
    const descriptions = ratingsAtEnd.map(rating => rating.description.toString())
    expect(descriptions).toContain('Very blanced and soft. Coffee and salty liqourice.')
  })

  test('valid rating is also saved in user and beer', async () => {
    const res = await api
      .post('/api/ratings')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(helper.newRating)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const users = await helper.usersInDb()
    const beers = await helper.beersInDb()
    const beer = beers.find(beer => beer.id === res.body.beer)

    expect(users[0].ratings.length).toBe(1)
    expect(users[0].ratings[0].toString()).toBe(res.body.id.toString())
    expect(beer.ratings.length).toBe(1)
    expect(beer.ratings[0].toString()).toBe(res.body.id.toString())
  })

  test('a valid rating with minimum fields can be added', async () => {
    const newRating = {
      aroma: 8,
      taste: 8,
      mouthfeel: 5,
      appearance: 4,
      overall: 18,
      beerId: '5d3da448fe4a36ce485c14c4'
    }

    await api
      .post('/api/ratings')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newRating)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const ratingsAtEnd = await helper.ratingsInDb()
    expect(ratingsAtEnd.length).toBe(helper.initialRatings.length + 1)
    const contents = ratingsAtEnd.map(rating => rating.beer.toString())
    expect(contents).toContain('5d3da448fe4a36ce485c14c4')
  })

  test('rating without aroma cannot be added', async () => {
    const newRating = {
      taste: 8,
      mouthfeel: 5,
      appearance: 4,
      overall: 18,
      beerId: '5d3da448fe4a36ce485c14c4'
    }

    const res = await api
      .post('/api/ratings')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newRating)
      .expect(400)

    const ratingsAtEnd = await helper.ratingsInDb()
    expect(ratingsAtEnd.length).toBe(helper.initialRatings.length)
    expect(res.body.error).toContain('`aroma` is required')
  })

  test('rating without taste cannot be added', async () => {
    const newRating = {
      aroma: 8,
      mouthfeel: 5,
      appearance: 4,
      overall: 18,
      beerId: '5d3da448fe4a36ce485c14c4'
    }

    const res = await api
      .post('/api/ratings')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newRating)
      .expect(400)

    const ratingsAtEnd = await helper.ratingsInDb()
    expect(ratingsAtEnd.length).toBe(helper.initialRatings.length)
    expect(res.body.error).toContain('`taste` is required')
  })

  test('rating without mouthfeel cannot be added', async () => {
    const newRating = {
      taste: 8,
      aroma: 5,
      appearance: 4,
      overall: 18,
      beerId: '5d3da448fe4a36ce485c14c4'
    }

    const res = await api
      .post('/api/ratings')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newRating)
      .expect(400)

    const ratingsAtEnd = await helper.ratingsInDb()
    expect(ratingsAtEnd.length).toBe(helper.initialRatings.length)
    expect(res.body.error).toContain('`mouthfeel` is required')
  })

  test('rating without appearance cannot be added', async () => {
    const newRating = {
      taste: 8,
      mouthfeel: 5,
      aroma: 4,
      overall: 18,
      beerId: '5d3da448fe4a36ce485c14c4'
    }

    const res = await api
      .post('/api/ratings')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newRating)
      .expect(400)

    const ratingsAtEnd = await helper.ratingsInDb()
    expect(ratingsAtEnd.length).toBe(helper.initialRatings.length)
    expect(res.body.error).toContain('`appearance` is required')
  })

  test('rating without overall cannot be added', async () => {
    const newRating = {
      taste: 8,
      mouthfeel: 5,
      appearance: 4,
      aroma: 9,
      beerId: '5d3da448fe4a36ce485c14c4'
    }

    const res = await api
      .post('/api/ratings')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newRating)
      .expect(400)

    const ratingsAtEnd = await helper.ratingsInDb()
    expect(ratingsAtEnd.length).toBe(helper.initialRatings.length)
    expect(res.body.error).toContain('`overall` is required')
  })

  test('rating without beer cannot be added', async () => {
    const newRating = {
      taste: 8,
      mouthfeel: 5,
      appearance: 4,
      aroma: 9,
      overall: 16
    }

    const res = await api
      .post('/api/ratings')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newRating)
      .expect(400)

    const ratingsAtEnd = await helper.ratingsInDb()
    expect(ratingsAtEnd.length).toBe(helper.initialRatings.length)
    expect(res.body.error).toContain('`beer` is required')
  })

  test('beer with too high fields cannot be added', async () => {
    const newRating = {
      aroma: 11,
      taste: 11,
      mouthfeel: 6,
      appearance: 6,
      overall: 21,
      ageofbeer: 361,
      description: helper.stringOfLength(1001),
      beerId: '5d3da448fe4a36ce485c14c4'
    }

    const res = await api
      .post('/api/ratings')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newRating)
      .expect(400)

    const ratingsAtEnd = await helper.ratingsInDb()
    expect(ratingsAtEnd.length).toBe(helper.initialRatings.length)
    expect(res.body.error).toContain('`aroma` (11) is more than maximum')
    expect(res.body.error).toContain('`taste` (11) is more than maximum')
    expect(res.body.error).toContain('`mouthfeel` (6) is more than maximum')
    expect(res.body.error).toContain('`appearance` (6) is more than maximum')
    expect(res.body.error).toContain('`overall` (21) is more than maximum')
    expect(res.body.error).toContain('`ageofbeer` (361) is more than maximum')
  })

  test('beer with too low fields cannot be added', async () => {
    const newRating = {
      aroma: -1,
      taste: -1,
      mouthfeel: -1,
      appearance: -1,
      overall: -1,
      ageofbeer: -1,
      beerId: '5d3da448fe4a36ce485c14c4'
    }

    const res = await api
      .post('/api/ratings')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newRating)
      .expect(400)

    const ratingsAtEnd = await helper.ratingsInDb()
    expect(ratingsAtEnd.length).toBe(helper.initialRatings.length)
    expect(res.body.error).toContain('`aroma` (-1) is less than minimum')
    expect(res.body.error).toContain('`taste` (-1) is less than minimum')
    expect(res.body.error).toContain('`mouthfeel` (-1) is less than minimum')
    expect(res.body.error).toContain('`appearance` (-1) is less than minimum')
    expect(res.body.error).toContain('`overall` (-1) is less than minimum')
    expect(res.body.error).toContain('`ageofbeer` (-1) is less than minimum')
  })

  test('cannot add rating if token is missing', async () => {
    const res = await api
      .post('/api/ratings')
      .send(helper.newRating)
      .expect(401)

    const ratingsAtEnd = await helper.ratingsInDb()
    expect(ratingsAtEnd.length).toBe(helper.initialRatings.length)
    expect(res.body.error).toBe('token is missing')
  })
})

afterAll(() => {
  mongoose.connection.close()
})