const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

/**
 * Lacks tests concerning of adding picture for user
 * also tests for populating user
 */

let login = null

beforeEach(async () => {
  await helper.initializeDatabase()

  const pass = await bcrypt.hash('salainen', 10)
  const user2 = new User({ username: 'ToinenKayttaja', passwordHash: pass, name: 'Toka', email: 'toinen@fi' })
  await user2.save()

  login = await api
    .post('/api/login')
    .send({ username: 'Rolli', password: 'salainen' })
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
    expect(usersAtStart.length).toBe(helper.initialUsers.length + 1)
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

  /** not yet working correctly
  test('users are populated correctly', async () => {
    const res = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body).toContainEqual({
      id: '5d4bc0527958a42219ca2032',
      username: 'Rölli',
      name: 'Peikko',
      email: 'www.rolli-peikko.fi',
      stash: [
        {
          id: '9d3da464fe4a36ce485c14c3',
          count: 2,
          volume: 0.33,
          price: 4.90,
          bottled: new Date('03.05.2019').toISOString(),
          expiration: new Date('01.01.2020').toISOString(),
          beer: {
            id: '5d3da458fe4a36ce485c14c5',
            brewery: {
              id: '5d4841d1f580955190e03e37',
              name: 'Westvleteren'
            },
            name: 'XII',
            abv: 12.2
          }
        }
      ],
      ratings: []
    })
  })
  */
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

    expect(res.body.error).toContain('password must be between 5-20 characters')
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

    expect(res.body.error).toContain('password must be between 5-20 characters')
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

describe('test covering DELETEing users', () => {
  test('delete existing user works', async () => {
    const usersAtStart = await helper.usersInDb()
    const userToDelete = usersAtStart.find(u => u.username === 'Rolli')

    await api
      .delete(`/api/users/${userToDelete.id}`)
      .set('Authorization', 'Bearer ' + login.body.token)
      .expect(204)

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd.length).toBe(usersAtStart.length - 1)
    expect(usersAtEnd.map(u => u.id)).not.toContain(userToDelete.id)
  })

  test('deleting user removes all its ratings and bottles', async () => {
    /**
     * tätä ei ole vielä toteutettu skeemaan
     */
  })

  test('cannot delete someone else', async () => {
    const usersAtStart = await helper.usersInDb()
    const userToDelete = usersAtStart[0]

    const loginToinen = await api
      .post('/api/login')
      .send({ username: 'ToinenKayttaja', password: 'salainen' })

    const res = await api
      .delete(`/api/users/${userToDelete.id}`)
      .set('Authorization', 'Bearer ' + loginToinen.body.token)
      .expect(401)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
    expect(usersAtEnd.map(u => u.id)).toContain(userToDelete.id)
    expect(res.body.error).toBe('no authorization to delete user')
  })

  test('delete unexisting user returns bad request', async () => {
    const usersAtStart = await helper.usersInDb()

    const res = await api
      .delete('/api/users/5d3da464fe4a36ce485c14c9')
      .set('Authorization', 'Bearer ' + login.body.token)
      .expect(404)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
    expect(res.body.error).toBe('no such user')
  })

  test('delete user without token not possible', async () => {
    const usersAtStart = await helper.usersInDb()
    const userToDelete = usersAtStart[0]

    const res = await api
      .delete(`/api/users/${userToDelete.id}`)
      .expect(401)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
    expect(res.body.error).toBe('token is missing')
  })
})

describe('tests covering PUTing existing user in database', () => {
  test('updating existing user works', async () => {
    const usersAtStart = await helper.usersInDb()
    const user = usersAtStart.find(u => u.username === 'Rolli')

    const newUser = {
      ...user,
      name: 'Hillevi',
      email: 'hillevi.fi',
      country: 'Jamaica',
      city: 'Down Town',
      hidden: true
    }

    await api
      .put(`/api/users/${user.id}`)
      .send(newUser)
      .set('Authorization', 'Bearer ' + login.body.token)
      .expect(201)

    const usersAtEnd = await helper.usersInDb()
    const updatedUser = usersAtEnd.find(u => u.username === 'Rolli')

    expect(updatedUser.name).toBe('Hillevi')
    expect(updatedUser.email).toBe('hillevi.fi')
    expect(updatedUser.country).toBe('Jamaica')
    expect(updatedUser.city).toBe('Down Town')
    expect(updatedUser.hidden).toBe(true)
  })

  test('cannot update someone else', async () => {
    const usersAtStart = await helper.usersInDb()
    const userToUpdate = usersAtStart.find(u => u.username === 'Rolli')

    const newUser = {
      ...userToUpdate,
      name: 'Hillevi',
      email: 'hillevi.fi',
      country: 'Jamaica',
      city: 'Down Town',
      hidden: true
    }

    const loginToinen = await api
      .post('/api/login')
      .send({ username: 'ToinenKayttaja', password: 'salainen' })

    const res = await api
      .put(`/api/users/${userToUpdate.id}`)
      .send(newUser)
      .set('Authorization', 'Bearer ' + loginToinen.body.token)
      .expect(401)

    const usersAtEnd = await helper.usersInDb()
    const updatedUser = usersAtEnd.find(u => u.username === 'Rolli')

    expect(updatedUser.name).not.toBe('Hillevi')
    expect(updatedUser.email).not.toBe('hillevi.fi')
    expect(updatedUser.country).not.toBe('Jamaica')
    expect(updatedUser.city).not.toBe('Down Town')
    expect(updatedUser.hidden).not.toBe(true)
    expect(res.body.error).toBe('no authorization to update user')
  })

  test('update user without token not possible', async () => {
    const usersAtStart = await helper.usersInDb()
    const userToUpdate = usersAtStart[0]

    const newUser = {
      ...userToUpdate,
      name: 'Hillevi',
      email: 'hillevi.fi',
      country: 'Jamaica',
      city: 'Down Town',
      hidden: true
    }

    const res = await api
      .put(`/api/users/${userToUpdate.id}`)
      .send(newUser)
      .expect(401)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
    expect(res.body.error).toBe('token is missing')
  })
})


afterAll(() => {
  mongoose.connection.close()
})