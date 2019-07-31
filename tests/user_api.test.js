const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const helper = require('./test_helper')

beforeEach(async () => {
  await User.deleteMany({})

  const users = helper.initialUsers
    .map(user => new User(user))

  const promiseArray = users.map(user => user.save())
  await Promise.all(promiseArray)
})

describe('tests covering GETting users from database', () => {
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
    expect(res.body[0]._id).not.toBeDefined()
  })
})

describe('tests covering POSTing users in database', () => {
  test('a valid user can be added and saved right', async () => {
    const usersAtStart = await helper.usersInDb()

    const res = await api
      .post('/api/users')
      .send(helper.newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

    const names = usersAtEnd.map(user => user.name)
    expect(names).toContain(helper.newUser.name)

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(helper.newUser.username)

    const emails = usersAtEnd.map(user => user.email)
    expect(emails).toContain(helper.newUser.email)

    expect(res.body.password).not.toBeDefined()
    expect(res.body.passwordHash).not.toBeDefined()
  })

  test('cannot add user with same username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Somero',
      name: 'Liisa',
      password: 'lissu',
      email: '@liisa.fi'
    }

    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(res.body.error).toContain('`username` to be unique')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('cannot add user with too short username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Anna',
      name: 'Liisa',
      password: 'lissu',
      email: '@liisa.fi'
    }

    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(res.body.error).toContain('`username` (`Anna`) is shorter than the minimum')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('cannot add user with too short password', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Anna-Liisa',
      name: 'Liisa',
      password: 'anna',
      email: '@liisa.fi'
    }

    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(res.body.error).toContain('password too short')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('cannot add user with empty username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: '',
      name: 'Liisa',
      password: 'lissu',
      email: '@liisa.fi'
    }

    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(res.body.error).toContain('`username` is required')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('cannot add user with empty password', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Somero',
      name: 'mikki',
      password: '',
      email: '@liisa.fi'
    }

    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(res.body.error).toContain('password too short')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('cannot add user with empty name', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Somero',
      name: '',
      password: 'salainen',
      email: '@liisa.fi'
    }

    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(res.body.error).toContain('`name` is required')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('cannot add user with same email', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Listamiini',
      name: 'Liisa',
      password: 'lissu',
      email: 'miika.fi'
    }

    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(res.body.error).toContain('`email` to be unique')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})