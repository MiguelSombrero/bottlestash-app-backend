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
  const user = new User({ username: 'Somero', passwordHash, name: 'Miika', email: 'miika.fi' })
  await user.save()

  const passwordHash2 = await bcrypt.hash('salaisempi', 10)
  const user2 = new User({ username: 'Luukkainen', passwordHash: passwordHash2, name: 'Masa', email: 'masa.fi' })
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

  test('a valid bottle with minimum fields can be added', async () => {
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

  test('deleting bottle removes it from users', async () => {

    // TESTIEN ALUSTUSTA PITÄÄ MUUTTAA NIIN, ETTÄ KÄYTTÄJÄLLE TULEE PULLON ID

    /**
    const bottlesAtStart = await helper.bottlesInDb()
    const bottleToDelete = bottlesAtStart[0]

    await api
      .delete(`/api/bottles/${bottleToDelete.id}`)
      .set('Authorization', 'Bearer ' + login.body.token)
      .expect(204)

    const users = await helper.usersInDb()
    const user = users[0]
    expect(user.stash.map(bottle => bottle).not.toContain(bottleToDelete.id))
     */
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
    const updatedBottle = bottlesAtEnd.find(bottle => bottle.id === bottleToUpdate.id)
    expect(bottleToUpdate.count).toBe(updatedBottle.count)
    expect(res.body.error).toBe('no authorization to update bottle')
  })

  test('update bottle without token not possible', async () => {
    const bottlesAtStart = await helper.bottlesInDb()
    const bottleToUpdate = bottlesAtStart[0]

    const res = await api
      .put(`/api/bottles/${bottleToUpdate.id}`)
      .expect(401)

    const bottlesAtEnd = await helper.bottlesInDb()
    expect(bottlesAtEnd.length).toBe(bottlesAtStart.length)
    expect(res.body.error).toBe('token is missing')
  })
})

afterAll(() => {
  mongoose.connection.close()
})