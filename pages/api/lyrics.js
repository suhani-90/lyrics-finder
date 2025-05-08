// pages/api/lyrics.js
import mongoose from 'mongoose';
import LyricsCache from '../../models/LyricsCache';

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
    console.error('Database connection error:', e);
    isConnected = false;
    throw new Error('Database connection failed');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { artist, title } = req.query;

  if (!artist || !title) {
    return res.status(400).json({ message: 'Artist and Title query parameters are required.' });
  }

  const lowerArtist = artist.trim().toLowerCase();
  const lowerTitle = title.trim().toLowerCase();

  try {
    await connectToDatabase();

    const cachedResult = await LyricsCache.findOne({
      artist: lowerArtist,
      title: lowerTitle,
    }).lean();

    if (cachedResult) {
      console.log(`CACHE HIT for: ${artist} - ${title}`);
      return res.status(200).json({ lyrics: cachedResult.lyrics, source: 'cache' });
    }

    console.log(`CACHE MISS for: ${artist} - ${title}. Fetching from lyrics.ovh...`);
    const externalApiUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    const apiResponse = await fetch(externalApiUrl);

    // --- START: IMPROVED LYRICS.OVH ERROR HANDLING ---
    if (!apiResponse.ok) {
      // If lyrics.ovh returns a non-2xx status (e.g., 404 Not Found)
      console.log(`lyrics.ovh API returned status: ${apiResponse.status} for ${artist} - ${title}`);
      let errorMessage = `Lyrics not found for "${title}" by "${artist}".`; // Default user-friendly message

      try {
        // lyrics.ovh sometimes returns a JSON error message, e.g., {"error":"No lyrics found"}
        const errorData = await apiResponse.json();
        if (errorData && errorData.error) {
          // Use their error message if available and more specific
          errorMessage = errorData.error;
        }
      } catch (jsonParseError) {
        // If parsing their error response fails, stick to our default or a generic one
        console.warn("Could not parse error response from lyrics.ovh:", jsonParseError);
      }

      // Return a 404 (Not Found) status from YOUR API if lyrics.ovh couldn't find it
      return res.status(404).json({ message: errorMessage, source: 'api (lyrics.ovh - not found)' });
    }
    // --- END: IMPROVED LYRICS.OVH ERROR HANDLING ---

    const data = await apiResponse.json(); // Now we expect this to be successful JSON

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
      // This case handles if lyrics.ovh returns 200 OK but the 'lyrics' field is missing/empty
      // It's less common than a 404 but good to cover.
      console.log(`lyrics.ovh returned 200 OK but no lyrics data for ${artist} - ${title}`);
      return res.status(404).json({ message: `Lyrics data not found for "${title}" by "${artist}".`, source: 'api (lyrics.ovh - no data)' });
    }

  } catch (error) {
    console.error("Error in /api/lyrics handler:", error.message);
    if (error.message === 'Database connection failed') {
        return res.status(503).json({ message: 'Service temporarily unavailable (DB issue). Please try again later.' });
    }
    // Any other unhandled error becomes a generic 500
    return res.status(500).json({ message: 'Internal Server Error while processing lyrics request.' });
  }
}