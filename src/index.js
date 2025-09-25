import dotenv from "dotenv";

dotenv.config();

import express from "express";
import bodyParser from "body-parser";

import { verifySignature } from "./signature.js";

import {
  handleBranchEvent,
  handleIssues,
  handlePullRequest,
  handlePush,
  handleRelease,
  handleWorkflowJob,
  handleWorkflowRun,
} from "./git-events.js";

const app = express();
const PORT = process.env.PORT || 4002;
const BASE_PATH = "notify-api";

export const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "your-webhook-secret";

app.use(bodyParser.json());



app.use(`/${BASE_PATH}/service/webhook`, verifySignature, async (req, res, next) => {
  const event = req.headers["x-github-event"];
  const action = req.body.action;
  const payload = req.body;

  console.log(`Git Notifications:📡 Evento recebido: ${event}${action ? ` (${action})` : ""}`);

  switch (event) {
    case "workflow_run":
      handleWorkflowRun(payload);
      break;
    case "workflow_job":
      handleWorkflowJob(payload);
      break;
    case "pull_request":
      handlePullRequest(payload);
      break;
    case "push":
      handlePush(payload);
      break;
    case "create":
    case "delete":
      handleBranchEvent(payload, event);
      break;
    case "issues":
      handleIssues(payload);
      break;
    case "release":
      handleRelease(payload);
      break;
    default:
      console.log(`Git Notifications:⚠️ Evento não tratado: ${event}`);
  }

  return res.status(200).send("OK");
});

app.use(`/${BASE_PATH}/health`, (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Git Notifications:🚀 Webhook server rodando na porta ${PORT}`);
  console.log(`Git Notifications:📡 Endpoint: http://localhost:${PORT}/${BASE_PATH}/service/webhook`);
  console.log(`Git Notifications:ℹ️ Health check: http://localhost:${PORT}/${BASE_PATH}/health`);
  console.log(`Git Notifications:🔐 Secret configurado: ${WEBHOOK_SECRET ? "Sim" : "Não"}`);
  console.log(`Git Notifications:ℹ️ Certifique-se de configurar o webhook no GitHub com o mesmo secret.`);
  console.log(
    `Git Notifications:ℹ️ Eventos suportados: workflow_run, workflow_job, pull_request, push, create, delete, issues, release`
  );
});

process.on("unhandledRejection", (err) => {
  console.error("Git Notifications:❌ Unhandled Promise Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Git Notifications:❌ Uncaught Exception:", err);
  process.exit(1);
});
