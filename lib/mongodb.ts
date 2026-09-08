import { MongoClient, type Db } from 'mongodb'
import {
  contacts as mockContacts,
  calls as mockCalls,
  phoneNumbers as mockPhoneNumbers,
  voiceAgents as mockVoiceAgents,
  campaigns as mockCampaigns,
  demoUser,
  demoOrganization,
} from './mock-data'

const uri =
  process.env.MONGODB_URI ||
  (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD
    ? `mongodb+srv://${encodeURIComponent(process.env.MONGODB_USER)}:${encodeURIComponent(
        process.env.MONGODB_PASSWORD
      )}@${process.env.MONGODB_HOST || 'cluster0.mongodb.net'}/${
        process.env.MONGODB_DB || 'centennial_connect'
      }?retryWrites=true&w=majority`
    : '')

const options = {
  serverSelectionTimeoutMS: 4000,
  connectTimeoutMS: 5000,
}

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient | null>

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient | null> | undefined
}

if (!uri) {
  clientPromise = Promise.resolve(null)
} else {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options)
      global._mongoClientPromise = client.connect().catch((err) => {
        console.warn('⚠️ [MongoDB] Connection warning (running in hybrid/offline fallback mode):', err.message)
        return null
      })
    }
    clientPromise = global._mongoClientPromise
  } else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect().catch((err) => {
      console.warn('⚠️ [MongoDB] Connection warning:', err.message)
      return null
    })
  }
}

export async function getMongoClient(): Promise<MongoClient | null> {
  try {
    return await clientPromise
  } catch {
    return null
  }
}

export async function getDatabase(): Promise<Db | null> {
  try {
    const cli = await getMongoClient()
    if (!cli) return null
    return cli.db(process.env.MONGODB_DB || 'centennial_connect')
  } catch {
    return null
  }
}

let isSeeded = false

/**
 * Ensures initial collections exist and have sample data if running for the first time
 */
export async function ensureDbSeeded() {
  if (isSeeded) return
  try {
    const db = await getDatabase()
    if (!db) return

    const contactsColl = db.collection('contacts')
    const count = await contactsColl.countDocuments()
    if (count === 0) {
      console.log('🌱 [MongoDB] Seeding initial data for Centennial Connect...')
      await contactsColl.insertMany(mockContacts.map((c) => ({ ...c, _id: undefined })))
      await db.collection('calls').insertMany(mockCalls.map((c) => ({ ...c, _id: undefined })))
      await db.collection('numbers').insertMany(mockPhoneNumbers.map((n) => ({ ...n, _id: undefined })))
      await db.collection('agents').insertMany(mockVoiceAgents.map((a) => ({ ...a, _id: undefined })))
      await db.collection('campaigns').insertMany(mockCampaigns.map((c) => ({ ...c, _id: undefined })))
      await db.collection('users').insertOne({
        ...demoUser,
        _id: undefined,
        passwordHash: 'demo1234',
        organization: demoOrganization,
      })
      console.log('✅ [MongoDB] Seed complete.')
    }
    isSeeded = true
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('⚠️ [MongoDB] Seed skipped:', msg)
  }
}

export { clientPromise }
