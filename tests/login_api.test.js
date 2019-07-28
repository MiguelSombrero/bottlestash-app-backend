const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const helper = require('./test_helper')

beforeEach(async () => {
  await User.deleteMany({})
  let user = new User(await helper.initialUser())
  await user.save()
})

describe('when there is user in database', () => {
  test('login with valid credentials succeeds', async () => {
    const res = await api
      .post('/api/login')
      .send({ username: 'Somero', password: 'salainen' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body.username).toBe('Somero')
    expect(res.body.name).toBe('Miika')
  })

  test('login with wrong password fails', async () => {
    const res = await api
      .post('/api/login')
      .send({ username: 'Somero', password: 'vaarin' })
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(res.body.error).toBe('invalid username or password')
  })

  test('login with wrong username fails', async () => {
    const res = await api
      .post('/api/login')
      .send({ username: 'Hiirola', password: 'salainen' })
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(res.body.error).toBe('invalid username or password')
  })

  test('login with empty credentials fails', async () => {
    const res = await api
      .post('/api/login')
      .send({ username: '', password: '' })
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(res.body.error).toBe('invalid username or password')
  })

  test('login with null credentials fails', async () => {
    const res = await api
      .post('/api/login')
      .send({ username: null, password: null })
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(res.body.error).toBe('invalid username or password')
  })

  test('login with no credentials fails', async () => {
    const res = await api
      .post('/api/login')
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(res.body.error).toBe('invalid username or password')
  })
})

afterAll(() => {
  mongoose.connection.close()
})