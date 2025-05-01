// pages/lyrics.js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link'; // For the back button
import styles from '../styles/Home.module.css'; // Reuse styles for simplicity

export default function LyricsPage() {
  const router = useRouter();
  const { artist, title } = router.query; // Get artist/title from URL query params

  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch lyrics when artist/title are available from the router
  useEffect(() => {
    // Only fetch if artist and title are present in the query
    if (artist && title) {
      const fetchLyrics = async () => {
        setLoading(true);
        setError('');
        setLyrics(''); // Clear previous lyrics

        try {
          const apiUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
          const response = await fetch(apiUrl);

          if (!response.ok) {
            throw new Error(`Song not found or API error (Status: ${response.status})`);
          }

          const data = await response.json();

          if (data.lyrics) {
            // Replace \n (newline character) with <br /> for HTML display if needed
            // Although <pre> usually handles this, sometimes direct API returns need help
            // setLyrics(data.lyrics.replace(/\n/g, '<br />'));
            setLyrics(data.lyrics); // Pre tag handles newlines well
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

      fetchLyrics();
    }
  }, [artist, title]); // Re-run effect if artist or title changes

  // Display loading state if router is not ready yet or fetching
  if (router.isFallback || loading || !artist || !title ) {
     // Initial load or fetch in progress
     if (!artist && !title && !router.isFallback) {
        // Handle case where someone navigates directly without params
        return <div className={styles.container}><main className={styles.main}><p>Please search for a song first.</p><Link href="/" legacyBehavior><a>← Back to Search</a></Link></main></div>;
     }
      return (
          <div className={styles.container}>
              <Head>
                  <title>Loading Lyrics...</title>
              </Head>
              <main className={styles.main}>
                  <div className={styles.loader}></div>
                  <p style={{ textAlign: 'center' }}>Loading lyrics for {decodeURIComponent(artist || '')} - {decodeURIComponent(title || '')}...</p>
                   <Link href="/" legacyBehavior>
                      <a className={styles.backLink}>← Back to Search</a>
                  </Link>
              </main>
          </div>
      );
  }


  return (
    <div className={styles.container}>
      <Head>
        <title>Lyrics | {decodeURIComponent(artist || '')} - {decodeURIComponent(title || '')}</title>
      </Head>

      <main className={styles.main} style={{ maxWidth: '800px' }}> {/* Wider container for lyrics */}
        <Link href="/" legacyBehavior>
           <a className={styles.backLink}>← Back to Search</a>
        </Link>

        {error && <p className={`${styles.error} ${styles.fullWidthError}`}>{error}</p>}

        {!error && lyrics && (
          <>
            <h1 className={styles.lyricsTitle}>
              {decodeURIComponent(title)}
            </h1>
            <p className={styles.lyricsArtist}>by {decodeURIComponent(artist)}</p>
            <pre className={`${styles.lyrics} ${styles.fullPageLyrics}`}>{lyrics}</pre>
          </>
        )}
        {!error && !lyrics && !loading && (
            <p>Lyrics not found.</p> // Should be caught by error state mostly
        )}
      </main>
    </div>
  );
}