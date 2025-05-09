// lib/dbConnect.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

//if URI not found
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env or your deployment environment variables'
  );
}

//if loaded multiple times reuse same cache object
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
if (!cached.promise) {
  const opts = {
      bufferCommands: false, //will prevent commands from pilling up
  };
  cached.promise = mongoose.connect(MONGODB_URI, opts).then(/* ... */);
}

//main 
async function dbConnect() {
  console.log("Attempting DB connection...");
  //checks if conn exists
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }
 
  //if first conn or previous failed
  try {
    cached.conn = await cached.promise;
    console.log('NEW DB connection established successfully!'); 
  } catch (e) {
    cached.promise = null;
    console.error("DATABASE CONNECTION FAILED:", e); 
    throw e;
  }
  return cached.conn;
}
//error handling during await
try {
  await dbConnect();
  console.log("DB Connection confirmed.");
  const testDoc = await LyricsCache.findOne().lean(); 
  console.log("Test doc found:", testDoc);

} catch (error) {
  console.error("API Handler Error (after test query):", error);
 
}

export default dbConnect;
