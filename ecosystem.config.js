module.exports = {
  apps: [
    {
      name: "simplix-bot-notifications",
      script: "./src/index.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
