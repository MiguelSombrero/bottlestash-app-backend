const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Beer = require('../models/beer')
const User = require('../models/user')
const Bottle = require('../models/bottle')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

/**
 * Lacks tests concerning of adding picture for bottle
 */

let login = null

beforeEach(async () => {
  await Beer.deleteMany({})
  await User.deleteMany({})
  await Bottle.deleteMany({})

  const passwordHash = await bcrypt.hash('salainen', 10)
  const user = new User({
    username: 'Somero',
    passwordHash,
    name: 'Miika',
    email: 'miika.fi',
    hidden: false
  })
  await user.save()

  const passwordHash2 = await bcrypt.hash('salaisempi', 10)
  const user2 = new User({
    username: 'Luukkainen',
    passwordHash: passwordHash2,
    name: 'Masa',
    email: 'masa.fi',
    hidden: true
  })
  await user2.save()

  login = await api
    .post('/api/login')
    .send({ username: 'Somero', password: 'salainen' })

  const beers = helper.initialBeers
    .map(beer => new Beer(beer))

  const promiseArrayBeer = beers.map(beer => beer.save())
  await Promise.all(promiseArrayBeer)

  const bottles = helper.initialBottles
    .map(bottle => new Bottle({ ...bottle, user: user._id }))

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

  test('bottles is populated with user, beer and brewery', async () => {
    const res = await api
      .get('/api/bottles')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body[0].beer.name).toBeDefined()
    expect(res.body[0].beer.abv).toBeDefined()
    expect(res.body[0].beer.brewery.name).toBeDefined()
    expect(res.body[0].user.name).toBeDefined()
    expect(res.body[0].user.hidden).toBeDefined()
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
    const contents = bottlesAtEnd.map(bottle => bottle.beer.toString())
    expect(contents).toContain('5d3da464fe4a36ce485c14c6')
  })

  test('a valid bottle is also saved in user', async () => {
    const res = await api
      .post('/api/bottles')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(helper.newBottle)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const users = await helper.usersInDb()
    expect(users[0].stash.length).toBe(1)
    expect(users[0].stash[0].toString()).toBe(res.body.id.toString())
  })

  test('bottle without necessary fields cannot be added', async () => {
    const newBottle = {
      price: 19.90,
      bottled: new Date('08.31.2019').toISOString(),
      expiration: new Date('11.02.2026').toISOString()
    }

    const res = await api
      .post('/api/bottles')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBottle)
      .expect(400)

    const bottlesAtEnd = await helper.bottlesInDb()
    expect(bottlesAtEnd.length).toBe(helper.initialBottles.length)

    expect(res.body.error).toContain('`count` is required')
    expect(res.body.error).toContain('`volume` is required')
    expect(res.body.error).toContain('`beer` is required')
  })

  test('bottle with too low field values cannot be added', async () => {
    const newBottle = {
      count: -1,
      volume: -0.75,
      price: -19.90,
      bottled: new Date('08.31.1989').toISOString(),
      expiration: new Date('11.02.1989').toISOString(),
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
    expect(res.body.error).toContain('`volume` (-0.75) is less than minimum')
    expect(res.body.error).toContain('`price` (-19.9) is less than minimum')
    expect(res.body.error).toContain('`bottled` (Thu Aug 31 1989 00:00:00 GMT+0300 (Eastern European Summer Time)) is before minimum')
    expect(res.body.error).toContain('`expiration` (Thu Nov 02 1989 00:00:00 GMT+0200 (Eastern European Standard Time)) is before minimum')
  })

  test('bottle with too high field values cannot be added', async () => {
    const newBottle = {
      count: 51,
      volume: 11,
      price: 501,
      bottled: new Date('08.31.2051').toISOString(),
      expiration: new Date('11.02.2051').toISOString(),
      beer: '5d3da464fe4a36ce485c14c8'
    }

    const res = await api
      .post('/api/bottles')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBottle)
      .expect(400)

    const bottlesAtEnd = await helper.bottlesInDb()
    expect(bottlesAtEnd.length).toBe(helper.initialBottles.length)
    expect(res.body.error).toContain('`count` (51) is more than maximum')
    expect(res.body.error).toContain('`volume` (11) is more than maximum')
    expect(res.body.error).toContain('`price` (501) is more than maximum')
    expect(res.body.error).toContain('`bottled` (Thu Aug 31 2051 00:00:00 GMT+0300 (Eastern European Summer Time)) is after maximum')
    expect(res.body.error).toContain('`expiration` (Thu Nov 02 2051 00:00:00 GMT+0200 (Eastern European Standard Time)) is after maximum')
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

  test('returned bottle is populated with user, beer and brewery', async () => {
    const res = await api
      .post('/api/bottles')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(helper.newBottle)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body.beer.name).toBeDefined()
    expect(res.body.beer.abv).toBeDefined()
    expect(res.body.beer.brewery.name).toBeDefined()
    expect(res.body.user.name).toBeDefined()
    expect(res.body.user.hidden).toBeDefined()
  })
})

describe('test covering DELETEing bottles', () => {
  test('delete existing bottle works', async () => {
    const bottlesAtStart = await helper.bottlesInDb()
    const bottleToDelete = bottlesAtStart[0]

    await api
      .delete(`/api/bottles/${bottleToDelete.id}`)
      .set('Authorization', 'Bearer ' + login.body.token)
      .expect(204)

    const bottlesAtEnd = await helper.bottlesInDb()

    expect(bottlesAtEnd.length).toBe(bottlesAtStart.length - 1)
    expect(bottlesAtEnd.map(bottle => bottle.id)).not.toContain(bottleToDelete.id)
  })

  test('cannot delete someone elses bottle', async () => {
    const bottlesAtStart = await helper.bottlesInDb()
    const bottleToDelete = bottlesAtStart[0]

    const loginMasa = await api
      .post('/api/login')
      .send({ username: 'Luukkainen', password: 'salaisempi' })

    const res = await api
      .delete(`/api/bottles/${bottleToDelete.id}`)
      .set('Authorization', 'Bearer ' + loginMasa.body.token)
      .expect(401)

    const bottlesAtEnd = await helper.bottlesInDb()
    expect(bottlesAtEnd.length).toBe(bottlesAtStart.length)
    expect(bottlesAtEnd.map(bottle => bottle.id)).toContain(bottleToDelete.id)
    expect(res.body.error).toBe('no authorization to delete bottle')
  })

  test('delete unexisting bottle returns bad request', async () => {
    const bottlesAtStart = await helper.bottlesInDb()

    const res = await api
      .delete('/api/bottles/5d3da464fe4a36ce485c14c6')
      .set('Authorization', 'Bearer ' + login.body.token)
      .expect(404)

    const bottlesAtEnd = await helper.bottlesInDb()
    expect(bottlesAtEnd.length).toBe(bottlesAtStart.length)
    expect(res.body.error).toBe('no such bottle')
  })

  test('delete bottle without token not possible', async () => {
    const bottlesAtStart = await helper.bottlesInDb()
    const bottleToDelete = bottlesAtStart[0]

    const res = await api
      .delete(`/api/bottles/${bottleToDelete.id}`)
      .expect(401)

    const bottlesAtEnd = await helper.bottlesInDb()
    expect(bottlesAtEnd.length).toBe(bottlesAtStart.length)
    expect(res.body.error).toBe('token is missing')
  })
})

describe('tests covering PUTing existing bottles in database', () => {
  test('updating existing bottle works', async () => {
    const bottlesAtStart = await helper.bottlesInDb()
    const bottleToUpdate = bottlesAtStart[0]

    const newBottle = {
      ... bottleToUpdate, count: bottleToUpdate.count + 1
    }

    await api
      .put(`/api/bottles/${bottleToUpdate.id}`)
      .send(newBottle)
      .set('Authorization', 'Bearer ' + login.body.token)
      .expect(201)

    const bottlesAtEnd = await helper.bottlesInDb()
    const updatedBottle = bottlesAtEnd.find(bottle => bottle.id === bottleToUpdate.id)

    expect(bottlesAtEnd.length).toBe(bottlesAtStart.length)
    expect(bottleToUpdate.count).toBe(updatedBottle.count - 1)
  })

  test('cannot update someone elses bottle', async () => {
    const bottlesAtStart = await helper.bottlesInDb()
    const bottleToUpdate = bottlesAtStart[0]

    const newBottle = {
      ... bottleToUpdate, count: bottleToUpdate.count + 1
    }

    const loginMasa = await api
      .post('/api/login')
      .send({ username: 'Luukkainen', password: 'salaisempi' })

    const res = await api
      .put(`/api/bottles/${bottleToUpdate.id}`)
      .send(newBottle)
      .set('Authorization', 'Bearer ' + loginMasa.body.token)
      .expect(401)

    const bottlesAtEnd = await helper.bottlesInDb()
    const updatedBottle = await bottlesAtEnd.find(bottle => bottle.id === bottleToUpdate.id)
    expect(bottleToUpdate.count).toBe(updatedBottle.count)
    expect(res.body.error).toBe('no authorization to update bottle')
  })

  test('update bottle without token not possible', async () => {
    const bottlesAtStart = await helper.bottlesInDb()
    const bottleToUpdate = bottlesAtStart[0]

    const newBottle = {
      ... bottleToUpdate, count: bottleToUpdate.count + 1
    }

    const res = await api
      .put(`/api/bottles/${bottleToUpdate.id}`)
      .send(newBottle)
      .expect(401)

    const bottlesAtEnd = await helper.bottlesInDb()
    expect(bottlesAtEnd.length).toBe(bottlesAtStart.length)
    expect(res.body.error).toBe('token is missing')
  })

  test('updated bottle is populated with user, beer and brewery', async () => {
    const bottlesAtStart = await helper.bottlesInDb()
    const bottleToUpdate = bottlesAtStart[0]

    const newBottle = {
      ... bottleToUpdate, count: bottleToUpdate.count + 1
    }

    const res = await api
      .put(`/api/bottles/${bottleToUpdate.id}`)
      .send(newBottle)
      .set('Authorization', 'Bearer ' + login.body.token)
      .expect(201)

    expect(res.body.beer.name).toBeDefined()
    expect(res.body.beer.abv).toBeDefined()
    expect(res.body.beer.brewery.name).toBeDefined()
    expect(res.body.user.name).toBeDefined()
    expect(res.body.user.hidden).toBeDefined()
  })
})

afterAll(() => {
  mongoose.connection.close()
})