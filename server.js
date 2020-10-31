process.env.DEBUG = 'wind:*,avatar'
const BootStrap = require('wind-boot')
const http = require('wind-core-http')
const config = require('./config')
const avatar = require('./src/avatar-gen/AvatarWorker')

const bootApp = new BootStrap(Object.assign(config, {
  packages: [http, avatar]
}))

bootApp.start()