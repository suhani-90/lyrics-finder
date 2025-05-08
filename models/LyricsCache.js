// models/LyricsCache.js
import mongoose from 'mongoose';

const LyricsCacheSchema = new mongoose.Schema({
  artist: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  lyrics: {
    type: String,
    required: true,
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
    // Optional: Add TTL index to auto-expire old cache entries
    // expires: '30d', // e.g., expire after 30 days
  },
  sourceApi: {
    type: String,
    default: 'lyrics.ovh',
  },
});

// Unique compound index for artist+title to prevent duplicates and speed up lookups
LyricsCacheSchema.index({ artist: 1, title: 1 }, { unique: true });

export default mongoose.models.LyricsCache || mongoose.model('LyricsCache', LyricsCacheSchema);