// pages/api/lyrics.js
import mongoose from 'mongoose';
import LyricsCache from '../../models/LyricsCache';

//connection to database
const MONGODB_URI = process.env.MONGODB_URI;
let isConnected = false;

async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }
  try {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    isConnected = true;
  } catch (e) {
    //if database connection fails
    console.error('Database connection error:', e);
    isConnected = false;
    throw new Error('Database connection failed');
  }
}

//main function for request hit
export default async function handler(req, res) {//http request response
  //only get request should be processed
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
  
 //validation if artist title provided
  const { artist, title } = req.query;
  if (!artist || !title) {
    return res.status(400).json({ message: 'Artist and Title query parameters are required.' });
  }

  const lowerArtist = artist.trim().toLowerCase();
  const lowerTitle = title.trim().toLowerCase();

  //main
  try {
    //checks if song already exists
    await connectToDatabase();
    const cachedResult = await LyricsCache.findOne({
      artist: lowerArtist,
      title: lowerTitle,
    }).lean();
    
    //if song found in cache
    if (cachedResult) {
      console.log(`CACHE HIT for: ${artist} - ${title}`);
      return res.status(200).json({ lyrics: cachedResult.lyrics, source: 'cache' });
    }
    //if not then from api
    console.log(`CACHE MISS for: ${artist} - ${title}. Fetching from lyrics.ovh...`);
    const externalApiUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    const apiResponse = await fetch(externalApiUrl);

   //lyrics not available
    if (!apiResponse.ok) {
      console.log(`lyrics.ovh API returned status: ${apiResponse.status} for ${artist} - ${title}`);
      let errorMessage = `Lyrics not found for "${title}" by "${artist}".`; // Default user-friendly message

      try {
        const errorData = await apiResponse.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (jsonParseError) {
       
        console.warn("Could not parse error response from lyrics.ovh:", jsonParseError);
      }
      return res.status(404).json({ message: errorMessage, source: 'api (lyrics.ovh - not found)' });
    }
   
    //lyrics fetched ,cache it
    const data = await apiResponse.json(); 
    if (data.lyrics) {
      try {
        await LyricsCache.findOneAndUpdate(
          { artist: lowerArtist, title: lowerTitle },
          {
            artist: lowerArtist,
            title: lowerTitle,
            lyrics: data.lyrics,
            fetchedAt: new Date(),
            sourceApi: 'lyrics.ovh',
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log(`CACHED lyrics from lyrics.ovh for: ${artist} - ${title}`);
      } catch (dbError) {
        console.error(`Failed to cache lyrics for ${artist} - ${title}:`, dbError);
      }
      return res.status(200).json({ lyrics: data.lyrics, source: 'api (lyrics.ovh)' });
    } else {
      console.log(`lyrics.ovh returned 200 OK but no lyrics data for ${artist} - ${title}`);
      return res.status(404).json({ message: `Lyrics data not found for "${title}" by "${artist}".`, source: 'api (lyrics.ovh - no data)' });
    }
  //general error
  } catch (error) {
    console.error("Error in /api/lyrics handler:", error.message);
    if (error.message === 'Database connection failed') {
        return res.status(503).json({ message: 'Service temporarily unavailable (DB issue). Please try again later.' });
    }
    //Any other error 500
    return res.status(500).json({ message: 'Internal Server Error while processing lyrics request.' });
  }
}