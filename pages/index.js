// pages/index.js
import Head from 'next/head';
import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // This state will hold our UI message
  const [source, setSource] = useState('');

  const handleSearch = async () => {
    setLyrics('');
    setError(''); // Clear previous UI errors
    setLoading(true);
    setSource('');

    if (!artist || !title) {
      setError('Please enter both artist and title.'); // Set UI error
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
      const data = await response.json(); // Get the JSON body

      if (response.ok) { // Status codes 200-299 are OK
        if (data.lyrics) {
          setLyrics(data.lyrics);
          setSource(data.source || '');
          setError(''); // Explicitly clear any previous error on success
        } else {
          // This case is if your API returns 200 OK but no lyrics (less likely with current backend)
          setError(data.message || 'Lyrics data not found in successful response.');
        }
      } else {
        // Handle non-ok responses (like 404 "No lyrics found" from your API, or 500, etc.)
        // data.message should contain the "No lyrics found" or other error from your API
        console.warn("API Response Not OK:", response.status, data); // Log for dev insight
        setError(data.message || `An error occurred: Status ${response.status}`);
        // ***** NO "throw new Error(...)" HERE *****
      }
    } catch (err) {
      // This catch block is now mainly for actual network errors (fetch itself fails)
      // or unexpected errors during JSON parsing if the response isn't valid JSON.
      console.error("Network or Parsing Error in handleSearch:", err);
      setError('A network error occurred, or the response was unreadable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Lyrics Finder (DB Cached)</title>
        <meta name="description" content="Find song lyrics with database caching" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Lyrics Finder (DB Cached)
        </h1>

        <div className={styles.searchForm}>
           <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Enter Artist"
            className={styles.input}
            aria-label="Artist Input"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Song Title"
            className={styles.input}
            aria-label="Song Title Input"
          />
          <button onClick={handleSearch} disabled={loading} className={styles.button}>
            Search Lyrics
          </button>
          <p className={styles.hint}>
            Tip: Double-check artist & song spelling for best results!
          </p>
        </div>

        <div className={styles.results}>
          {loading && <div className={styles.loader}></div>}
          {/* This will now display the "No lyrics found" (or other API error) message from your API */}
          {!loading && error && <p className={styles.error}>{error}</p>}
          {/* Only show lyrics if NO error and lyrics exist */}
          {!loading && !error && lyrics && (
            <div>
               {source && <p className={styles.sourceIndicator}>Lyrics from: {source}</p>}
              <h2>Lyrics</h2>
              <pre className={styles.lyrics}>{lyrics}</pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}