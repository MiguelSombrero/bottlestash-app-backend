const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Beer = require('../models/beer')

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
  let beer = new Beer(initialBeers[0])
  await beer.save()
  beer = new Beer(initialBeers[1])
  await beer.save()
  beer = new Beer(initialBeers[2])
  await beer.save()
  beer = new Beer(initialBeers[3])
  await beer.save()
})

describe('when there are initial beers', () => {

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

afterAll(() => {
  mongoose.connection.close()
})