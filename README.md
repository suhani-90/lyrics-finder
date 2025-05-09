This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

# Simple Lyrics Finder

This is a simple web application built which allows users to search for song lyrics by Artist and Title using the free `lyrics.ovh` API and displays the results.

The project focuses on demonstrating core frontend concepts using Next.js and deploying a static site to AWS S3.

Features:

*   Search for lyrics by Artist and Song Title.
*   Fetches lyrics from the `lyrics.ovh` public API.
*   Displays fetched lyrics with preserved formatting.
*   Includes a loading indicator during API calls.
*   Handles and displays basic errors (e.g., song not found, network issues).
*   Provides user hints for better search results.
*   Basic responsive design with improved styling for a better user experience.
*   Built for static export and deployment.

## Tech Stack

*   **Framework:** Next.js (v13+ with Pages Router configured for static export)
*   **Language:** JavaScript (ES6+)
*   **UI Library:** React
*   **Styling:** CSS Modules
*   **API:** `lyrics.ovh` (Public, free)
*   **Deployment:** AWS S3 Static Website Hosting


## API Used

*   **lyrics.ovh API:** This project relies on the free, public API provided by `lyrics.ovh`.
*   **Documentation:** [https://lyricsovh.docs.apiary.io/](https://lyricsovh.docs.apiary.io/)
*   **Limitations:** As a free service, it may have rate limits, occasional downtime, or incomplete lyrics data.

Example Searches

Here are a few examples that generally work well with the `lyrics.ovh` API (remember to check spelling!):

*   Artist: `Queen`
    Title: `Bohemian Rhapsody`
*   Artist: `The Beatles`
    Title: `Hey Jude`
*   Artist: `Coldplay`
    Title: `Yellow`
*   Artist: `Adele`
    Title: `Hello`
*   Artist: `Eagles`
    Title: `Hotel California`
*   Artist: `Nirvana`
    Title: `Smells Like Teen Spirit`
*   Artist: `Oasis`
    Title: `Wonderwall`

Thank you for reviewing this demo project!
