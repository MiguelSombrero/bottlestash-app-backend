const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const Picture = require('../models/picture')
const bcrypt = require('bcrypt')
const FormData = require('form-data')
const fs = require('fs')

/**
 * no tests for pictures written yet!
 */

let login = null
let picture = null

beforeEach(async () => {
  await Picture.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('salainen', 10)
  const user = new User({ username: 'Somero', passwordHash, name: 'Miika' })
  await user.save()

  login = await api
    .post('/api/login')
    .send({ username: 'Somero', password: 'salainen' })
})

describe('tests covering POSTing pictures in database', () => {
  test('a valid picture can be added', async () => {
    picture = await fs.readFileSync(`${__dirname}/files/beer1.jpg`)
    const form = new FormData()
    form.append('picture', picture)

    const res = await api
      .post('/api/pictures')
      .set('Authorization', 'Bearer ' + login.body.token)
      .set('Content-Type', 'multipart/form-data')
      .send(form)
      .expect(200)
      .expect('Content-Type', /image\/*/)

  })
})

afterAll(() => {
  mongoose.connection.close()
})