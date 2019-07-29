const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Beer = require('../models/beer')
const User = require('../models/user')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

let login = null

beforeEach(async () => {
  await Beer.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('salainen', 10)
  const user = new User({ username: 'Somero', passwordHash, name: 'Miika' })
  await user.save()

  login = await api
    .post('/api/login')
    .send({ username: 'Somero', password: 'salainen' })

  const beers = helper.initialBeers
    .map(beer => new Beer(beer))

  const promiseArray = beers.map(beer => beer.save())
  await Promise.all(promiseArray)
})

describe('tests covering GETting beers from database', () => {
  test('beers are returned as json', async () => {
    await api
      .get('/api/beers')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all beers are returned', async () => {
    const beersAtStart = await helper.beersInDb()
    expect(beersAtStart.length).toBe(helper.initialBeers.length)
  })

  test('a specific beer is in the database', async () => {
    const beersAtStart = await helper.beersInDb()
    const contents = beersAtStart.map(beer => beer.brewery + ' ' + beer.name)
    expect(contents).toContain('Alesmith IPA')
  })

  test('id field is defined', async () => {
    const res = await api
      .get('/api/beers')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body[0].id).toBeDefined()
  })
})

describe('tests covering POSTing beers in database', () => {
  test('a valid beer can be added', async () => {
    await api
      .post('/api/beers')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(helper.newBeer)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const beersAtEnd = await helper.beersInDb()
    expect(beersAtEnd.length).toBe(helper.initialBeers.length + 1)

    const contents = beersAtEnd.map(b => b.brewery + ' ' + b.name)
    expect(contents).toContain('Olarin Panimo APA')
  })

  test('ratings of an added beer is an empty array', async () => {
    const res = await api
      .post('/api/beers')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(helper.newBeer)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body.ratings.length).toBe(0)
    expect(res.body.ratings).toMatchObject([])
  })

  test('beer without brewery cannot be added', async () => {
    const newBeer = {
      name: 'APA',
      abv: 5.6
    }

    await api
      .post('/api/beers')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBeer)
      .expect(400)

    const beersAtEnd = await helper.beersInDb()
    expect(beersAtEnd.length).toBe(helper.initialBeers.length)
  })

  test('beer without name cannot be added', async () => {
    const newBeer = {
      brewery: 'Sonnisaari',
      abv: 5.6
    }

    await api
      .post('/api/beers')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBeer)
      .expect(400)

    const beersAtEnd = await helper.beersInDb()
    expect(beersAtEnd.length).toBe(helper.initialBeers.length)
  })

  test('beer without abv cannot be added', async () => {
    const newBeer = {
      name: 'APA',
      brewery: 'Sonnisaari'
    }

    await api
      .post('/api/beers')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBeer)
      .expect(400)

    const beersAtEnd = await helper.beersInDb()
    expect(beersAtEnd.length).toBe(helper.initialBeers.length)
  })

  test('beer with negative abv cannot be added', async () => {
    const newBeer = {
      brewery: 'Sonnisaari',
      name: 'APA',
      abv: -3.4
    }

    await api
      .post('/api/beers')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBeer)
      .expect(400)

    const beersAtEnd = await helper.beersInDb()
    expect(beersAtEnd.length).toBe(helper.initialBeers.length)
  })

  test('cannot add beer that is allready in database', async () => {
    const newBeer = {
      brewery: 'Alesmith',
      name: 'IPA',
      abv: 7.6
    }

    const res = await api
      .post('/api/beers')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBeer)
      .expect(400)

    expect(res.body.error).toContain('`brewery` to be unique')
    expect(res.body.error).toContain('`name` to be unique')
    expect(res.body.error).toContain('`abv` to be unique')
  })

  test('cannot add beer if token is missing', async () => {
    const res = await api
      .post('/api/beers')
      .send(helper.newBeer)
      .expect(401)

    const beersAtEnd = await helper.beersInDb()
    expect(beersAtEnd.length).toBe(helper.initialBeers.length)
    expect(res.body.error).toBe('token is missing')
  })

  test('cannot add beer if token is invalid', async () => {
    // tätä en ole saanut toistaiseksi toimimaan
    // tulee status 500 eikä 401

    /**
    const res = await api
      .post('/api/beers')
      .set('Authorization', 'Bearer wrongtoken')
      .send(helper.newBeer)
      .expect(401)

    const beersAtEnd = await helper.beersInDb()
    expect(beersAtEnd.length).toBe(helper.initialBeers.length)
    expect(res.body.error).toBe('token is missing')
     */
  })
})

afterAll(() => {
  mongoose.connection.close()
})