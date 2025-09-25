import dotenv from "dotenv";

dotenv.config();

import crypto from "crypto";

import { WEBHOOK_SECRET } from "./index.js";


export function verifySignature(req, res, next) {
  const signature = req.headers["x-hub-signature-256"];
  const payload = JSON.stringify(req.body);
  const expectedSignature = `sha256=${crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload, "utf8")
    .digest("hex")}`;

  if (signature !== expectedSignature) {
    console.log("verifySignature: ❌ Assinatura github inválida");
    return res.status(401).send("Unauthorized");
  }
  next();
}
