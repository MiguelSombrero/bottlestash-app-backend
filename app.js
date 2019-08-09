const config = require('./utils/config')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const usersRouter = require('./controllers/users')
const beersRouter = require('./controllers/beers')
const bottlesRouter = require('./controllers/bottles')
const breweriesRouter = require('./controllers/breweries')
const ratingsRouter = require('./controllers/ratings')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const mongoose = require('mongoose')
const logger = require('./utils/logger')

logger.info('connecting to', config.MONGODB_URI)

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    logger.info('connected to MongoDb')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDb', error.message)
  })

app.use(cors())
app.use(express.static('build'))
app.use(bodyParser.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)
app.use('/api/beers', beersRouter)
app.use('/api/bottles', bottlesRouter)
app.use('/api/breweries', breweriesRouter)
app.use('/api/ratings', ratingsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app