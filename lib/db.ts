const MONGODB_URI = process.env.NEXT_PUBLIC_MONGO_URI

if (!MONGODB_URI) {
  throw new Error("Please define the NEXT_PUBLIC_MONGO_URI environment variable")
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongoose: MongooseCache
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI!, opts)
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

// File Schema
const fileSchema = new mongoose.Schema({
  originalName: String,
  fileName: String,
  size: Number,
  compressedSize: Number,
  path: String,
  createdAt: { type: Date, expires: 300, default: Date.now }, // 5 minutes TTL
})

export const File = mongoose.models.File || mongoose.model("File", fileSchema)

