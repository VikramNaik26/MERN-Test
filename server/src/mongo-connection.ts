import mongoose from 'mongoose'
import { logger } from './logger'

// Remove the global promise type assertion as it's no longer needed in modern versions
mongoose.Promise = global.Promise

/** Callback for establishing or re-establishing mongo connection */
interface IOnConnectedCallback {
  (): void
}

/**
 * A Mongoose Connection wrapper class to
 * help with mongo connection issues.
 *
 * This library tries to auto-reconnect to
 * MongoDB without crashing the server.
 */
export default class MongoConnection {
  /** URL to access mongo */
  private readonly mongoUrl: string
  /** Callback when mongo connection is established or re-established */
  private onConnectedCallback: IOnConnectedCallback = () => {}
  /**
   * Internal flag to check if connection established for
   * first time or after a disconnection
   */
  private isConnectedBefore: boolean = false
  /** Mongo connection options to be passed to Mongoose */
  private readonly mongoConnectionOptions: mongoose.ConnectOptions = {
    // Remove deprecated options
    // useNewUrlParser, useCreateIndex, and useUnifiedTopology are no longer needed
    // as they are now default behavior
  }

  /**
   * Start mongo connection
   * @param mongoUrl MongoDB URL
   */
  constructor(mongoUrl: string) {
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true)
    }

    this.mongoUrl = mongoUrl
    
    // Use modern event handling
    const connection = mongoose.connection
    connection.on('error', this.onError)
    connection.on('disconnected', this.onDisconnected)
    connection.on('connected', this.onConnected)
    connection.on('reconnected', this.onReconnected)
  }

  /** Close mongo connection */
  public async close(): Promise<void> {
    logger.log({
      level: 'info',
      message: 'Closing the MongoDB connection'
    })
    
    try {
      await mongoose.connection.close()
    } catch (err) {
      logger.log({
        level: 'error',
        message: `Error closing MongoDB connection: ${err}`
      })
      throw err
    }
  }

  /** Start mongo connection */
  public connect(onConnectedCallback: IOnConnectedCallback): void {
    this.onConnectedCallback = onConnectedCallback
    this.startConnection()
  }

  private startConnection = async () => {
    logger.log({
      level: 'info',
      message: `Connecting to MongoDB at ${this.mongoUrl}`
    })

    try {
      await mongoose.connect(this.mongoUrl, this.mongoConnectionOptions)
    } catch (err) {
      logger.log({
        level: 'error',
        message: `Failed to connect to MongoDB: ${err}`
      })
    }
  }

  /**
   * Handler called when mongo connection is established
   */
  private onConnected = () => {
    logger.log({
      level: 'info',
      message: `Connected to MongoDB at ${this.mongoUrl}`
    })
    this.isConnectedBefore = true
    this.onConnectedCallback()
  }

  /** Handler called when mongo gets re-connected to the database */
  private onReconnected = () => {
    logger.log({
      level: 'info',
      message: 'Reconnected to MongoDB'
    })
    this.onConnectedCallback()
  }

  /** Handler called for mongo connection errors */
  private onError = (error: Error) => {
    logger.log({
      level: 'error',
      message: `Could not connect to ${this.mongoUrl}`,
      error: error.message
    })
  }

  /** Handler called when mongo connection is lost */
  private onDisconnected = () => {
    if (!this.isConnectedBefore) {
      setTimeout(() => {
        this.startConnection()
      }, 2000)
      logger.log({
        level: 'info',
        message: 'Retrying mongo connection'
      })
    }
  }
}
