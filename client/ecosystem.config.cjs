// Serves the production build (dist/) instead of running Vite's dev server, kept
// alive by PM2 the same way the API's ecosystem file is.
// Build first (`npm run build`), then: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "vite-app",
      script: "serve", // PM2's bundled static file server
      env: {
        PM2_SERVE_PATH: "./dist",
        PM2_SERVE_PORT: 5173, // must match the port Nginx forwards to
        // Without this, a refresh on a route like /login asks the file server for
        // a file called "login", gets a 404, and React Router never gets to run.
        // "true" instead of true — env values are strings, not booleans.
        PM2_SERVE_SPA: "true",
      },
    },
  ],
};
