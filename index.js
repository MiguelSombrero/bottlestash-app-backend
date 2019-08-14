const app = require('./app')
const http = require('http')
const config = require('./utils/config')

const server = http.createServer(app)

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
}).on('error', (error) => {
  console.log('message:', error.message)
  console.log('stack:', error.stack)
  console.log('name:', error.name)
})