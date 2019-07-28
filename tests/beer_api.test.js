const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Beer = require('../models/beer')
const User = require('../models/user')
const helper = require('./test_helper')

beforeEach(async () => {
  await Beer.deleteMany({})
  await User.deleteMany({})

  let user = new User(await helper.initialUser())
  await user.save()

  let beer = new Beer(helper.initialBeers[0])
  await beer.save()
  beer = new Beer(helper.initialBeers[1])
  await beer.save()
  beer = new Beer(helper.initialBeers[2])
  await beer.save()
  beer = new Beer(helper.initialBeers[3])
  await beer.save()
})

describe('when there are some beers in database', () => {
  test('beers are returned as json', async () => {
    await api
      .get('/api/beers')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all beers are returned', async () => {
    const res = await api.get('/api/beers')
    expect(res.body.length).toBe(helper.initialBeers.length)
  })

  test('the first beer is Alesmith IPA', async () => {
    const res = await api.get('/api/beers')
    expect(res.body[0].brewery).toBe('Alesmith')
    expect(res.body[0].name).toBe('IPA')
  })
})

describe('addition of a beer', () => {
  test('a valid beer can be added', async () => {
    const login = await api
      .post('/api/login')
      .send({ username: 'Somero', password: 'salainen' })

    const newBeer = {
      brewery: 'Olarin Panimo',
      name: 'APA',
      abv: 5.6,
      ratings: []
    }

    await api
      .post('/api/beers')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(newBeer)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const res = await api.get('/api/beers')
    const contents = res.body.map(b => b.brewery + ' ' + b.name)

    expect(res.body.length).toBe(helper.initialBeers.length + 1)
    expect(contents).toContain('Olarin Panimo APA')
  })
})

afterAll(() => {
  mongoose.connection.close()
})