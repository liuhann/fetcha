process.env.DEBUG = 'wind:*'
const BootStrap = require('wind-boot')
const http = require('wind-core-http')
const config = require('./config')

const bootApp = new BootStrap(Object.assign(config, {
  packages: [http, (app) => {

  }]
}))

bootApp.start()