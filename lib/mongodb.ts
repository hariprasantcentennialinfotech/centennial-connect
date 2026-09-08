import { MongoClient, type Db, MongoClientOptions } from 'mongodb'
import bcrypt from 'bcryptjs'
import {
  contacts as mockContacts,
  calls as mockCalls,
  phoneNumbers as mockPhoneNumbers,
  voiceAgents as mockVoiceAgents,
  campaigns as mockCampaigns,
  demoUser,
  demoOrganization,
} from './mock-data'
import { logger } from './logger'
import { ensureIndexes } from './db/indexes'

const uri =
  process.env.MONGODB_URI ||
  (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD
    ? `mongodb+srv://${encodeURIComponent(process.env.MONGODB_USER)}:${encodeURIComponent(
        process.env.MONGODB_PASSWORD
      )}@${process.env.MONGODB_HOST || 'cluster0.mongodb.net'}/${
        process.env.MONGODB_DB || 'centennial_connect'
      }?retryWrites=true&w=majority`
    : '')

const mongoOptions: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient | null> | undefined
}

let clientPromise: Promise<MongoClient | null>

if (!uri) {
  logger.warn('MONGODB_URI is not set. MongoDB will run in mock / fallback mode.')
  clientPromise = Promise.resolve(null)
} else {
  // In serverless environments and local dev, preserve client promise globally to avoid connection exhaustion
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, mongoOptions)
    global._mongoClientPromise = client.connect().catch((err) => {
      logger.warn('MongoDB connection error (fallback mode active):', { error: err.message })
      return null
    })
  }
  clientPromise = global._mongoClientPromise
}

export async function getMongoClient(): Promise<MongoClient | null> {
  try {
    return await clientPromise
  } catch (err) {
    logger.error('Failed to resolve MongoClient promise', err)
    return null
  }
}

export async function getDatabase(): Promise<Db | null> {
  try {
    const cli = await getMongoClient()
    if (!cli) return null
    return cli.db(process.env.MONGODB_DB || 'centennial_connect')
  } catch (err) {
    logger.error('Failed to get database from client', err)
    return null
  }
}

let isSeeded = false

/**
 * Ensures initial collections exist and have sample data if running for the first time.
 * Uses hashed passwords for demo accounts.
 */
export async function ensureDbSeeded() {
  if (isSeeded) return
  try {
    const db = await getDatabase()
    if (!db) return

    const contactsColl = db.collection('contacts')
    const count = await contactsColl.countDocuments()
    if (count === 0) {
      logger.info('Seeding initial data for Centennial Connect MongoDB...')

      // Generate secure hash for demo user
      const demoHash = await bcrypt.hash('demo1234', 10)

      await contactsColl.insertMany(mockContacts.map((c) => ({ ...c, _id: undefined })))
      await db.collection('calls').insertMany(mockCalls.map((c) => ({ ...c, _id: undefined })))
      await db.collection('numbers').insertMany(mockPhoneNumbers.map((n) => ({ ...n, _id: undefined })))
      await db.collection('agents').insertMany(mockVoiceAgents.map((a) => ({ ...a, _id: undefined })))
      await db.collection('campaigns').insertMany(mockCampaigns.map((c) => ({ ...c, _id: undefined })))

      // Ensure demo organization exists
      await db.collection('organizations').insertOne({
        ...demoOrganization,
        _id: undefined,
        createdAt: new Date().toISOString(),
      })

      // Insert demo user with bcrypt password hash
      await db.collection('users').insertOne({
        ...demoUser,
        _id: undefined,
        organizationId: demoOrganization.id,
        passwordHash: demoHash,
        organization: demoOrganization,
      })

      logger.info('MongoDB seed complete with hashed credentials.')
    }

    // Ensure all multi-tenant and unique indexes are created
    await ensureIndexes(db)
    isSeeded = true
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.warn('MongoDB seed skipped:', { error: msg })
  }
}

export { clientPromise }
