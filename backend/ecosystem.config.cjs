module.exports = {
  apps: [
    {
      name: 'lms-backend',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
