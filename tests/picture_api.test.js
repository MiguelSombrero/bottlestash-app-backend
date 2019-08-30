const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const Picture = require('../models/picture')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const FormData = require('form-data')
const fs = require('fs')

let login = null

const picture1 = fs.readFileSync(`${__dirname}/files/beer1.jpg`)

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
    const form = new FormData()
    form.append('picture', `${__dirname}/files/beer1.jpg`)

    const res = await api
      .post('/api/pictures')
      .set('Authorization', 'Bearer ' + login.body.token)
      .set('Content-Type', 'multipart/form-data')
      .send(form)
      .expect(200)
      .expect('Content-Type', /image\/*/)

    console.log(res)
  })
})

afterAll(() => {
  mongoose.connection.close()
})