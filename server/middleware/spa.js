const express = require('express');
const path = require('path');
const fs = require('fs');

/**
 * Configure Single Page Application (SPA) serving logic.
 * This encapsulates static file serving and the catch-all routing
 * required for client-side routing.
 * 
 * @param {import('express').Application} app The Express application instance
 */
function setupSPA(app) {
  // Absolute paths for reliability across different deployment environments
  const distPath = path.resolve(__dirname, '../../client/dist');
  const indexPath = path.resolve(distPath, 'index.html');

  console.log(`[SPA Middleware] Target dist path: ${distPath}`);
  
  if (fs.existsSync(indexPath)) {
    console.log(`[SPA Middleware] index.html found at: ${indexPath}`);
  } else {
    console.warn(`[SPA Middleware] index.html NOT FOUND at: ${indexPath}. Client may not serve correctly.`);
  }

  // 1. Serve static assets (js, css, images, etc.)
  app.use(express.static(distPath));

  // 2. Catch-all to serve index.html for SPA routing
  // Using a middleware function with no path is the most robust way in Express 5
  // to handle routing without hitting wildcard path-to-regexp issues.
  app.use((req, res) => {
    // If the request is for a file that wasn't found in static (e.g. .js, .css)
    // but isn't a route, we could optionally handle it here. 
    // For SPA, we assume any unmatched GET request should receive index.html.
    if (req.method !== 'GET') {
      return res.status(405).send('Method Not Allowed');
    }

    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error(`[SPA Middleware] Error sending index.html: ${err.message}`);
        res.status(404).send('Frontend could not be loaded. Please ensure the build completed successfully.');
      }
    });
  });
}

module.exports = { setupSPA };
