//models/LyricsCache.js
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
  },
  sourceApi: {
    type: String,
    default: 'lyrics.ovh',
  },
});

// compound index for artist+title
LyricsCacheSchema.index({ artist: 1, title: 1 }, { unique: true });
export default mongoose.models.LyricsCache || mongoose.model('LyricsCache', LyricsCacheSchema);