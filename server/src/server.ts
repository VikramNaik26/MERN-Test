import dotenv from 'dotenv'

import { app } from './app'
import MongoConnection from './mongo-connection'
import { logger } from './logger'

// Load environment variables
const result = dotenv.config()
if (result.error) {
  dotenv.config({ path: '.env' })
}

// Validate MongoDB URL
const mongoUrl = process.env.MONGO_URL
if (mongoUrl == null) {
  logger.log({
    level: 'error',
    message: 'MONGO_URL not specified in environment'
  })
  process.exit(1)
}

// Initialize MongoDB connection
const mongoConnection = new MongoConnection(mongoUrl)

// Start the server
mongoConnection.connect(() => {
  app.listen(app.get('port'), (): void => {
    console.log('\x1b[36m%s\x1b[0m', // eslint-disable-line
      `🌏 Express server started at http://localhost:${app.get('port')}   `)
  })
})

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Gracefully shutting down')

  try {
    await mongoConnection.close()
    process.exit(0)
  } catch (error: unknown) {
    logger.log({
      level: 'error',
      message: 'Error shutting closing mongo connection',
      error: error instanceof Error ? error.message : String(error)
    })
    process.exit(1)
  }
})
