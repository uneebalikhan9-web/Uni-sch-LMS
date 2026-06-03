module.exports = {
  apps: [
    {
      name: 'lms-backend',
      script: './server.js',

      // Cluster mode uses all available CPU cores for maximum performance
      instances: 'max',
      exec_mode: 'cluster',

      // Auto-restart on crash
      max_restarts: 10,
      restart_delay: 3000,
      min_uptime: '10s',

      // Memory limit: auto-restart if memory exceeds 500MB
      max_memory_restart: '500M',

      // Graceful shutdown wait
      kill_timeout: 5000,

      // Log file configuration
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,

      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
