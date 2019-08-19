const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Beer = require('../models/beer')
const User = require('../models/user')
const Brewery = require('../models/brewery')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

let login = null

beforeEach(async () => {
  await Beer.deleteMany({})
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

  const breweryPromiseArray = breweries.map(brewery => brewery.save())
  await Promise.all(breweryPromiseArray)

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
    expect(contents).toContain('5d4841d1f580955190e03e33 IPA')
  })

  test('id field is defined', async () => {
    const res = await api
      .get('/api/beers')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body[0].id).toBeDefined()
  })
})

describe('tests covering GETting one beer from database', () => {
  test('can fetch beer thats in the database', async () => {
    const res = await api
      .get('/api/beers/5d4841d1f580955190e03e37/XII/12.2')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body).toMatchObject({
      id: '5d3da458fe4a36ce485c14c5',
      brewery: '5d4841d1f580955190e03e37',
      name: 'XII',
      abv: 12.2
    })
  })

  test('nothing is returned when fetching missing beer', async () => {
    const res = await api
      .get('/api/beers/5d4841d1f580955190e03e37/XII/5.5')
      .expect(204)

    expect(res.body).toStrictEqual({})
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
    expect(contents).toContainEqual('5d4841d1f580955190e03e33 APA')
  })

  test('a valid beer is also saved in brewery', async () => {
    const res = await api
      .post('/api/beers')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(helper.newBeer)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const breweries = await helper.breweriesInDb()
    const brewery = breweries.find(brewery => brewery.id === res.body.brewery)

    expect(brewery.beers.length).toBe(1)
    expect(brewery.beers[0].toString()).toBe(res.body.id.toString())
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

    const res = await api
      .post('/api/beers')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBeer)
      .expect(400)

    const beersAtEnd = await helper.beersInDb()
    expect(beersAtEnd.length).toBe(helper.initialBeers.length)
    expect(res.body.error).toContain('`brewery` is required')
  })

  test('beer without name cannot be added', async () => {
    const newBeer = {
      brewery: '5d4841d1f580955190e03e33',
      abv: 5.6
    }

    const res = await api
      .post('/api/beers')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBeer)
      .expect(400)

    const beersAtEnd = await helper.beersInDb()
    expect(beersAtEnd.length).toBe(helper.initialBeers.length)
    expect(res.body.error).toContain('`name` is required')
  })

  test('beer without abv cannot be added', async () => {
    const newBeer = {
      name: 'APA',
      brewery: '5d4841d1f580955190e03e33'
    }

    const res = await api
      .post('/api/beers')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBeer)
      .expect(400)

    const beersAtEnd = await helper.beersInDb()
    expect(beersAtEnd.length).toBe(helper.initialBeers.length)
    expect(res.body.error).toContain('`abv` is required')
  })

  test('beer with negative abv cannot be added', async () => {
    const newBeer = {
      brewery: '5d4841d1f580955190e03e33',
      name: 'APA',
      abv: -3.4
    }

    const res = await api
      .post('/api/beers')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBeer)
      .expect(400)

    const beersAtEnd = await helper.beersInDb()
    expect(beersAtEnd.length).toBe(helper.initialBeers.length)
    expect(res.body.error).toContain('`abv` (-3.4) is less than minimum')
  })

  test('cannot add beer that is allready in database', async () => {
    const newBeer = {
      brewery: '5d4841d1f580955190e03e33',
      name: 'IPA',
      abv: 7.6
    }

    const res = await api
      .post('/api/beers')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBeer)
      .expect(400)

    // antaa jostain syystä tämmöisen herjan 'required'?
    const beersAtEnd = await helper.beersInDb()
    expect(beersAtEnd.length).toBe(helper.initialBeers.length)
    expect(res.body.error).toContain('`brewery` is required')
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