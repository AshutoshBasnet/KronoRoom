// Runs the API under PM2 instead of `node server.js` directly, so it restarts on
// a crash and comes back after a reboot — see `pm2 startup` and `pm2 save`.
// Start with: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "api",
      script: "server.js",
    },
  ],
};
