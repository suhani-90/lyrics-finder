// lib/dbConnect.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env or your deployment environment variables'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
if (!cached.promise) {
  const opts = {
      bufferCommands: false, // << THIS IS GOOD, IT PREVENTS COMMANDS FROM PILING UP
  };
  cached.promise = mongoose.connect(MONGODB_URI, opts).then(/* ... */);
}
// Inside lib/dbConnect.js
async function dbConnect() {
  console.log("Attempting DB connection...");
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }
  // ...
  try {
    cached.conn = await cached.promise;
    console.log('NEW DB connection established successfully!'); // Add this
  } catch (e) {
    cached.promise = null;
    console.error("DATABASE CONNECTION FAILED:", e); // Check this error
    throw e;
  }
  return cached.conn;
}
try {
  await dbConnect();
  console.log("DB Connection confirmed.");
  const testDoc = await LyricsCache.findOne().lean(); // Find *any* document
  console.log("Test doc found:", testDoc);
  // ... rest of your logic for artist/title lookup ...
} catch (error) {
  console.error("API Handler Error (after test query):", error);
  // ...
}

export default dbConnect;
