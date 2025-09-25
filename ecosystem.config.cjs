module.exports = {
  apps: [
    {
      name: "simplix-bot-notifications",
      script: "./src/index.js",
      instances: "1",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
