import sirv from 'sirv'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import compression from 'compression'
import * as sapper from '@sapper/server'
import env from 'dotenv'
import resolvers from './api/register-api'
import typeDefs from './api/typeDefs'

env.config('.env')

const { PORT, NODE_ENV } = process.env
const dev = NODE_ENV === 'development'

const app = express()

// GraphQL Server
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const graphQLServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: req => ({ ...req }),
})

graphQLServer.applyMiddleware({
  app,
  path: '/__playground',
})

app
  .use(
    compression({ threshold: 0 }),
    sirv('static', { dev }),
    sapper.middleware()
  )
  .listen(PORT, err => {
    if (err) console.log('error', err)
  })
