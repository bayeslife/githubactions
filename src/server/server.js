import DotEnv from 'dotenv'
import Debug from 'debug'
import assert from 'assert'

import { Model } from 'real-value-lang'
import cors from 'cors'
import express from 'express'

import { Architecture } from '../application/application'
import { getSources } from '../connector/connector'

import { ChannelFactory} from 'real-value-channel-socketio-server-buffered'
import  ChannelFactoryPLog from 'real-value-channel-hypercore'

let DOTENV_CONFIG = process.env.ENVIRONMENT ? `.env.${process.env.ENVIRONMENT}` : '.env'
console.log(`Sourcing ${DOTENV_CONFIG}`)
DotEnv.config({path: DOTENV_CONFIG})

console.log(`Debugging with ${process.env.DEBUG}`)
const debug = Debug('app')

const app = express();
var server = require('http').createServer(app);

const channelFactoryPLog = ChannelFactoryPLog(process.env.PERSISTENT_LOG_DIRECTORY)
const channelPLog = channelFactoryPLog()

const routes = require('./routes.js')
const { pipeline } = require('./pipeline.js')
//const { productionGenerator } = require('../connector/producer.js')
const { connector } = require('../connector')

const authentication = require('./authentication')

assert(process.env.DIRECTORY,"environment variable DIRECTORY needs to be defined")
assert(process.env.BACKEND_URL,"environment variable BACKEND_URL needs to be defined")
assert(process.env.FRONTEND_URL,"environment variable FRONTEND_URL needs to be defined")

const config = {
  //env: process.env.ENVIRONMENT,
  backendUrl: process.env.BACKEND_URL,
  frontendUrl: process.env.FRONTEND_URL,
  port: process.env.SERVER_PORT,
  directory: process.env.DIRECTORY
}

debug(config)

app.use(cors({credentials: true,  origin: config.frontendUrl }));

require('./api-docs.js')(app)

function setupServer(){
  debug(`API listening on port ${config.port}!`)
  authentication.setup(app,config)
  
  let model = Model()

  let channelFactoryBrowser = ChannelFactory({server})

  const channelActivity = channelFactoryBrowser('activity')
  const channelProduction = channelFactoryBrowser('production')

  const sources = getSources(model)

  let architecture=Architecture()
    .setModel(model)
    .setSources(sources)

  //let productionSource = model.from(productionGenerator()).log().toChannel({channel:channelPLog})
  //let productionSource = model.from(productionGenerator()).log().toChannel({channel:channelPLog})
  //todo let productionSource = model.fromChannel({channel:channelHyperswarm})
  
  //let productionConnection = pipeline(productionSource)
  //productionConnection.toChannel({channel:channelProduction})

  architecture.stream_production.log().toChannel({channel:channelProduction})

  model.run()

  config.channel = channelActivity
  routes.setup(app,config)
}

debug("Starting Server")
server.listen(config.port, setupServer)



