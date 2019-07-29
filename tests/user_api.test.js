const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

describe('tests covering GETting users from database', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    let passwordHash = await bcrypt.hash('salainen', 10)

    let user = new User({
      username: 'Somero',
      passwordHash,
      name: 'Miika',
      email: 'miika.fi'
    })

    await user.save()

    passwordHash = await bcrypt.hash('salaisempi', 10)

    user = new User({
      username: 'Luukkainen',
      passwordHash,
      name: 'Masa',
      email: 'matti.fi'
    })

    await user.save()
  })

  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all users are returned', async () => {
    const usersAtStart = await helper.usersInDb()
    expect(usersAtStart.length).toBe(helper.initialUsers.length)
  })

  test('a specific user is in the database', async () => {
    const usersAtStart = await helper.usersInDb()
    const contents = usersAtStart.map(user => user.username)
    expect(contents).toContain('Luukkainen')
  })

  test('id field is defined', async () => {
    const res = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body[0].id).toBeDefined()
  })
})

describe('tests covering POSTing users in database', () => {
  test('a valid user can be added', async () => {
    const usersAtStart = await helper.usersInDb()

    await api
      .post('/api/users')
      .send(helper.newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(helper.newUser.username)
  })
})

afterAll(() => {
  mongoose.connection.close()
})