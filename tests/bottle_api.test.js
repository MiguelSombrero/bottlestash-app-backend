const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Beer = require('../models/beer')
const User = require('../models/user')
const Bottle = require('../models/bottle')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

let login = null

beforeEach(async () => {
  await Beer.deleteMany({})
  await User.deleteMany({})
  await Bottle.deleteMany({})

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
})

describe('tests covering GETting bottles from database', () => {
  test('bottles are returned as json', async () => {
    await api
      .get('/api/bottles')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all bottles are returned', async () => {
    const bottlesAtStart = await helper.bottlesInDb()
    expect(bottlesAtStart.length).toBe(helper.initialBottles.length)
  })

  test('a specific bottle is in the database', async () => {
    // kokeile tehdä tähän koko objektin vertailu 
    const bottlesAtStart = await helper.bottlesInDb()
    const contents = bottlesAtStart.map(bottle => bottle.beer.toString())
    expect(contents).toContain('5d3da458fe4a36ce485c14c5')
  })

  test('id field is defined', async () => {
    const res = await api
      .get('/api/bottles')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body[0].id).toBeDefined()
  })
})

describe('tests covering POSTing bottles in database', () => {
  test('a valid bottle can be added', async () => {
    await api
      .post('/api/bottles')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(helper.newBottle)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const bottlesAtEnd = await helper.bottlesInDb()
    expect(bottlesAtEnd.length).toBe(helper.initialBottles.length + 1)

    // kokeile tehdä tähän koko objektin vertailu
    const contents = bottlesAtEnd.map(bottle => bottle.beer.toString())
    expect(contents).toContain('5d3da464fe4a36ce485c14c6')
  })

  test('a valid bottle with minimun fields can be added', async () => {
    const newBottle = {
      count: 1,
      volume: 0.75,
      beer: '5d3da464fe4a36ce485c14c8'
    }

    await api
      .post('/api/bottles')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBottle)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const bottlesAtEnd = await helper.bottlesInDb()
    expect(bottlesAtEnd.length).toBe(helper.initialBottles.length + 1)

    // kokeile tehdä tähän koko objektin vertailu
    const contents = bottlesAtEnd.map(bottle => bottle.beer.toString())
    expect(contents).toContain('5d3da464fe4a36ce485c14c8')
  })

  test('bottle without count cannot be added', async () => {
    const newBottle = {
      volume: 0.75,
      price: 19.90,
      bottled: new Date('08.31.2019').toISOString(),
      expiration: new Date('11.02.2026').toISOString(),
      beer: '5d3da464fe4a36ce485c14c8'
    }

    const res = await api
      .post('/api/bottles')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBottle)
      .expect(400)

    const bottlesAtEnd = await helper.bottlesInDb()
    expect(bottlesAtEnd.length).toBe(helper.initialBottles.length)
    expect(res.body.error).toContain('`count` is required')
  })

  test('bottle without volume cannot be added', async () => {
    const newBottle = {
      count: 2,
      price: 19.90,
      bottled: new Date('08.31.2019').toISOString(),
      expiration: new Date('11.02.2026').toISOString(),
      beer: '5d3da464fe4a36ce485c14c8'
    }

    const res = await api
      .post('/api/bottles')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBottle)
      .expect(400)

    const bottlesAtEnd = await helper.bottlesInDb()
    expect(bottlesAtEnd.length).toBe(helper.initialBottles.length)
    expect(res.body.error).toContain('`volume` is required')
  })

  test('bottle without beer cannot be added', async () => {
    const newBottle = {
      volume: 0.75,
      price: 19.90,
      bottled: new Date('08.31.2019').toISOString(),
      expiration: new Date('11.02.2026').toISOString(),
      count: 2
    }

    const res = await api
      .post('/api/bottles')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBottle)
      .expect(400)

    const bottlesAtEnd = await helper.bottlesInDb()
    expect(bottlesAtEnd.length).toBe(helper.initialBottles.length)
    expect(res.body.error).toContain('`beer` is required')
  })

  test('bottle with negative count cannot be added', async () => {
    const newBottle = {
      count: -1,
      volume: 0.75,
      price: 19.90,
      bottled: new Date('08.31.2019').toISOString(),
      expiration: new Date('11.02.2026').toISOString(),
      beer: '5d3da464fe4a36ce485c14c8'
    }

    const res = await api
      .post('/api/bottles')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBottle)
      .expect(400)

    const bottlesAtEnd = await helper.bottlesInDb()
    expect(bottlesAtEnd.length).toBe(helper.initialBottles.length)
    expect(res.body.error).toContain('`count` (-1) is less than minimum')
  })

  test('bottle with negative volume cannot be added', async () => {
    const newBottle = {
      count: 1,
      volume: -0.75,
      price: 19.90,
      bottled: new Date('08.31.2019').toISOString(),
      expiration: new Date('11.02.2026').toISOString(),
      beer: '5d3da464fe4a36ce485c14c8'
    }

    const res = await api
      .post('/api/bottles')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBottle)
      .expect(400)

    const bottlesAtEnd = await helper.bottlesInDb()
    expect(bottlesAtEnd.length).toBe(helper.initialBottles.length)
    expect(res.body.error).toContain('`volume` (-0.75) is less than minimum')
  })

  test('bottle with negative price cannot be added', async () => {
    const newBottle = {
      count: 1,
      volume: 0.75,
      price: -19.9,
      bottled: new Date('08.31.2019').toISOString(),
      expiration: new Date('11.02.2026').toISOString(),
      beer: '5d3da464fe4a36ce485c14c8'
    }

    const res = await api
      .post('/api/bottles')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBottle)
      .expect(400)

    const bottlesAtEnd = await helper.bottlesInDb()
    expect(bottlesAtEnd.length).toBe(helper.initialBottles.length)
    expect(res.body.error).toContain('`price` (-19.9) is less than minimum')
  })

  test('cannot add bottle if token is missing', async () => {
    const res = await api
      .post('/api/bottles')
      .send(helper.newBottle)
      .expect(401)

    const bottlesAtEnd = await helper.bottlesInDb()
    expect(bottlesAtEnd.length).toBe(helper.initialBottles.length)
    expect(res.body.error).toBe('token is missing')
  })

  test('cannot add bottles if token is invalid', async () => {
    // tätä en ole saanut toistaiseksi toimimaan
    // tulee status 500 eikä 401

  })
})

afterAll(() => {
  mongoose.connection.close()
})