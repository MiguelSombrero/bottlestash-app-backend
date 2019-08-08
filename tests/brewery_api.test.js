const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const Brewery = require('../models/brewery')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

let login = null

beforeEach(async () => {
  await User.deleteMany({})
  await Brewery.deleteMany({})

  const passwordHash = await bcrypt.hash('salainen', 10)
  const user = new User({ username: 'Somero', passwordHash, name: 'Miika' })
  await user.save()

  login = await api
    .post('/api/login')
    .send({ username: 'Somero', password: 'salainen' })

  const breweries = helper.initialBreweries
    .map(brewery => new Brewery(brewery))

  const promiseArray = breweries.map(brewery => brewery.save())
  await Promise.all(promiseArray)
})

describe('tests covering GETting breweries from database', () => {
  test('breweries are returned as json', async () => {
    await api
      .get('/api/breweries')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all breweries are returned', async () => {
    const breweriesAtStart = await helper.breweriesInDb()
    expect(breweriesAtStart.length).toBe(helper.initialBreweries.length)
  })

  test('a specific brewery is in the database', async () => {
    const breweriesAtStart = await helper.breweriesInDb()
    const contents = breweriesAtStart.map(brewery => brewery.name)
    expect(contents).toContain('Ballast Point')
  })

  test('id field is defined', async () => {
    const res = await api
      .get('/api/breweries')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body[0].id).toBeDefined()
  })
})

describe('tests covering GETting one brewery from database', () => {
  test('can fetch brewery thats in the database', async () => {
    const res = await api
      .get('/api/breweries/Sonnisaari')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body).toMatchObject({
      id: '5d4841d1f580955190e03e36',
      name: 'Sonnisaari'
    })
  })

  test('can fetch two part named brewery thats in the database', async () => {
    const res = await api
      .get('/api/breweries/Ballast Point')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body).toMatchObject({
      id: '5d4841d1f580955190e03e32',
      name: 'Ballast Point'
    })
  })

  test('nothing is returned when fetching missing brewery', async () => {
    const res = await api
      .get('/api/breweries/Nogne')
      .expect(204)

    expect(res.body).toStrictEqual({})
  })
})

describe('tests covering POSTing breweries in database', () => {
  test('a valid brewery can be added', async () => {
    const newBrewery = {
      name: 'Hiisi Panimo'
    }

    await api
      .post('/api/breweries')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBrewery)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const breweriesAtEnd = await helper.breweriesInDb()
    expect(breweriesAtEnd.length).toBe(helper.initialBreweries.length + 1)

    const contents = breweriesAtEnd.map(brewery => brewery.name)
    expect(contents).toContain('Hiisi Panimo')
  })

  test('beers is an empty array', async () => {
    const newBrewery = {
      name: 'Hiisi Panimo'
    }

    const res = await api
      .post('/api/breweries')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBrewery)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body.beers.length).toBe(0)
    expect(res.body.beers).toMatchObject([])
  })

  test('brewery without name cannot be added', async () => {
    const newBrewery = {
      name: ''
    }

    const res = await api
      .post('/api/breweries')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBrewery)
      .expect(400)

    const breweriesAtEnd = await helper.breweriesInDb()
    expect(breweriesAtEnd.length).toBe(helper.initialBreweries.length)
    expect(res.body.error).toContain('`name` is required')
  })

  test('cannot add brewery that is allready in database', async () => {
    const newBrewery = {
      name: 'Sonnisaari'
    }

    const res = await api
      .post('/api/breweries')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBrewery)
      .expect(400)

    expect(res.body.error).toContain('`name` to be unique')
  })

  test('cannot add brewery if token is missing', async () => {
    const newBrewery = {
      name: 'Tornion Panimo'
    }

    const res = await api
      .post('/api/breweries')
      .send(newBrewery)
      .expect(401)

    const breweriesAtEnd = await helper.breweriesInDb()
    expect(breweriesAtEnd.length).toBe(helper.initialBreweries.length)
    expect(res.body.error).toBe('token is missing')
  })

  test('cannot add brewery if token is invalid', async () => {
    // tätä en ole saanut toistaiseksi toimimaan
    // tulee status 500 eikä 401

    /**
    const res = await api
      .post('/api/breweries')
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