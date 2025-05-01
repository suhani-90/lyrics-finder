import Head from 'next/head';
import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');

  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLyrics('');
    setError('');
    setLoading(true);

    if (!artist || !title) {
      setError('Please enter both artist and title.');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Song not found or API error (Status: ${response.status})`);
      }

      const data = await response.json();

      if (data.lyrics) {
        setLyrics(data.lyrics);
      } else {
        setError(data.error || 'Lyrics not found for this song.');
      }
    } catch (err) {
      console.error("API Fetch Error:", err);
      setError(err.message || 'An error occurred while fetching lyrics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Simple Lyrics Finder</title>
        <meta name="description" content="Find song lyrics quickly" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Simple Lyrics Finder
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
          {!loading && error && <p className={styles.error}>Error: {error}</p>}
          {!loading && lyrics && (
            <div>
              <h2>Lyrics</h2>
              <pre className={styles.lyrics}>{lyrics}</pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}