// import mongoose from 'mongoose'

// const MONGODB_URI = process.env.MONGODB_URI!

// if (!MONGODB_URI) {
//   throw new Error('Please define the MONGODB_URI environment variable')
// }

// interface MongooseCache {
//   conn: typeof mongoose | null
//   promise: Promise<typeof mongoose> | null
// }

// declare global {
//   var mongooseCache: MongooseCache
// }

// let cached: MongooseCache = global.mongooseCache

// if (!cached) {
//   cached = global.mongooseCache = { conn: null, promise: null }
// }

// console.log("Connecting to MongoDB...");
// console.log(process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, "//***:***@"));

// async function connectDB() {
//   if (cached.conn) {
//     return cached.conn
//   }

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false,
//     }

//     cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
//       return mongoose
//     })
//   }

//   try {
//     cached.conn = await cached.promise
//   } catch (e) {
//     cached.promise = null
//     throw e
//   }

//   return cached.conn
// }

// export default connectDB
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI missing");
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: Cached | undefined;
}

const cached =
  global.mongooseCache ??
  (global.mongooseCache = {
    conn: null,
    promise: null,
  });

export default async function connectDB() {
  if (cached.conn) {
    console.log("Mongo: using cached connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Mongo: opening new connection");

    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;

  console.log("Mongo: connected");

  return cached.conn;
}