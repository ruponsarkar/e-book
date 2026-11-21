
module.exports = {
  apps: [
    {
      name: "ebook-server",
      cwd: "/var/www/e-book/e-book/server",
      script: "npm",
      args: "start",
      interpreter: "none",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
