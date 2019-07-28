const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const Beer = require('../models/beer')
const User = require('../models/user')

const initialBeers = [
  {
    brewery: 'Alesmith',
    name: 'IPA',
    alcohol: 7.6,
    ratings: []
  },
  {
    brewery: 'Alesmith',
    name: 'Speedway Stout',
    alcohol: 12.8,
    ratings: []
  },
  {
    brewery: 'Westvleteren',
    name: 'XII',
    alcohol: 12.2,
    ratings: []
  },
  {
    brewery: 'Sonnisaari',
    name: 'IPA',
    alcohol: 6.2,
    ratings: []
  }
]

beforeEach(async () => {
  await Beer.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('salainen', 10)
  let user = new User({
    username: 'Somero',
    passwordHash,
    name: 'Miika'
  })

  await user.save()

  let beer = new Beer(initialBeers[0])
  await beer.save()
  beer = new Beer(initialBeers[1])
  await beer.save()
  beer = new Beer(initialBeers[2])
  await beer.save()
  beer = new Beer(initialBeers[3])
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
    const response = await api.get('/api/beers')
    expect(response.body.length).toBe(4)
  })

  test('the first beer is Alesmith IPA', async () => {
    const response = await api.get('/api/beers')
    expect(response.body[0].brewery).toBe('Alesmith')
    expect(response.body[0].name).toBe('IPA')
  })
})

describe('addition of a beer', () => {

  test('a valid beer can be added', async () => {
    const response = await api
      .post('/api/login')
      .send({
        username: 'Somero',
        password: 'salainen'
      })

    console.log(response.data)

    const newBeer = {
      brewery: 'Olarin Panimo',
      name: 'APA',
      alcohol: 5.6,
      ratings: []
    }

    await api
      .post('/api/beers')
      .set('Authorization', 'Bearer ' + response.data)
      .send(newBeer)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const res = await api.get('/api/beers')
    const contents = res.body.map(b => b.brewery + ' ' + b.name)

    expect(res.body.length).toBe(initialBeers.length + 1)
    expect(contents).toContain('Olarin Panimo APA')
  })
})

afterAll(() => {
  mongoose.connection.close()
})