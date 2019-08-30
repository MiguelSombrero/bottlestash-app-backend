const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

/**
 * Lacks tests concerning of adding picture for rating
 */

let login = null

beforeEach(async () => {
  await helper.initializeDatabase()

  login = await api
    .post('/api/login')
    .send({ username: 'Somero', password: 'salainen' })
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

  test('ratings is populated with user, beer and brewery', async () => {
    const res = await api
      .get('/api/ratings')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body[0].beer.name).toBeDefined()
    expect(res.body[0].beer.abv).toBeDefined()
    expect(res.body[0].beer.brewery.name).toBeDefined()
    expect(res.body[0].user.name).toBeDefined()
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

    const beer = beers.find(beer => beer.id === res.body.beer.id)

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

  test('rating without required fields cannot be added', async () => {
    const newRating = {
      description: 'Very good beer, hih'
    }

    const res = await api
      .post('/api/ratings')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newRating)
      .expect(400)

    const ratingsAtEnd = await helper.ratingsInDb()
    expect(ratingsAtEnd.length).toBe(helper.initialRatings.length)
    expect(res.body.error).toContain('`aroma` is required')
    expect(res.body.error).toContain('`taste` is required')
    expect(res.body.error).toContain('`mouthfeel` is required')
    expect(res.body.error).toContain('`appearance` is required')
    expect(res.body.error).toContain('`overall` is required')
    expect(res.body.error).toContain('`beer` is required')
  })

  test('rating with too high fields cannot be added', async () => {
    const newRating = {
      aroma: 11,
      taste: 11,
      mouthfeel: 6,
      appearance: 6,
      overall: 21,
      ageofbeer: 361,
      description: helper.stringOfLength(501),
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

  test('returned rating is populated with user, beer and brewery', async () => {
    const res = await api
      .post('/api/ratings')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(helper.newRating)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body.beer.name).toBeDefined()
    expect(res.body.beer.abv).toBeDefined()
    expect(res.body.beer.brewery.name).toBeDefined()
    expect(res.body.user.name).toBeDefined()
  })
})

afterAll(() => {
  mongoose.connection.close()
})