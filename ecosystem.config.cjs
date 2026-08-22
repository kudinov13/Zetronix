module.exports = {
  apps: [
    {
      name: "zetronix-server",
      cwd: "/var/www/zetronix",
      script: "npx",
      args: "tsx server/index.ts",
      env: {
        PORT: 3003,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "300M",
    },
  ],
};
