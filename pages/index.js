// pages/index.js
import Head from 'next/head';
import { useState } from 'react';
import styles from '../styles/Home.module.css';

//states saved
export default function Home() {
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 
  const [source, setSource] = useState('');

 //main searching
  const handleSearch = async () => {
    setLyrics('');
    setError(''); 
    setLoading(true);
    setSource('');

    if (!artist || !title) {
      setError('Please enter both artist and title.'); 
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
      const data = await response.json(); 
      if (response.ok) { // Status codes 200-299
        if (data.lyrics) {
          setLyrics(data.lyrics);
          setSource(data.source || '');
          setError(''); 
        } else {
          //Ok but lyrics not found
          setError(data.message || 'Lyrics data not found in successful response.');
        }
      } else {
        //Not Ok
        console.warn("API Response Not OK:", response.status, data); 
        setError(data.message || `An error occurred: Status ${response.status}`);

      }
    } catch (err) {
     //netwrok errors
      console.error("Network or Parsing Error in handleSearch:", err);
      setError('A network error occurred, or the response was unreadable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  //frontend part
  return (
    <div className={styles.container}>
      <Head>
        <title>Lyrics Finder</title>
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
          {/* */}
          {!loading && error && <p className={styles.error}>{error}</p>}
          {/*  */}
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
