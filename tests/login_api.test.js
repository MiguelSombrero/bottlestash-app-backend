const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('salainen', 10)
  let user = new User({
    username: 'Somero',
    passwordHash,
    name: 'Miika'
  })

  await user.save()
})

describe('when there is user in database', () => {

  test('login with valid credentials', async () => {
    const res = await api
      .post('/api/login')
      .send({ username: 'Somero', password: 'salainen' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body.username).toBe('Somero')
    expect(res.body.name).toBe('Miika')
  })
})

afterAll(() => {
  mongoose.connection.close()
})