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

console.log(picture1)

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

describe('tests covering GETting one picture from database', () => {
  test('can fetch picture thats in the database', async () => {
    const res = await api
      .get('/api/pictures/5d4841d1f580955190e03e37/XII/12.2')
      .expect(200)
      .expect('Content-Type', /image\/*/)

    
  })

  test('nothing is returned when fetching missing picture', async () => {
    const res = await api
      .get('/api/pictures/5d4841d1f580955190e03e37')
      .expect(204)

    expect(res.body).toStrictEqual({})
  })
})

describe('tests covering POSTing pictures in database', () => {
  test('a valid picture can be added', async () => {
    const picture = {
      filename: 'beer1.jpg',
      content: picture1,
      contentType: 'image/jpg',
      size: 5000
    }

    const form = new FormData()
    form.append('picture', picture)

    console.log(form)
    
    const res = await api
      .post('/api/pictures')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(form)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
      console.log(res)
  })

})  

afterAll(() => {
  mongoose.connection.close()
})