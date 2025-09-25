import dotenv from "dotenv";

dotenv.config();

import crypto from "crypto";

import { WEBHOOK_SECRET } from "./index.js";

let encoder = new TextEncoder();

export async function verifySignature(req, res, next) {
  try {
    const secret = WEBHOOK_SECRET;
    const header = req.headers["x-hub-signature-256"];
    const payload = req.rawBody;

    if (!header) {
      console.log("Git Notifications:🔐 Header de assinatura não encontrado.");
      return res.status(401).send("Header de assinatura ausente");
    }

    if (!payload) {
      console.log("Git Notifications:🔐 Corpo da requisição vazio.");
      return res.status(401).send("Corpo da requisição vazio");
    }

    let parts = header.split("=");
    if (parts.length !== 2 || parts[0] !== "sha256") {
      console.log("Git Notifications:🔐 Formato de assinatura inválido.");
      return res.status(401).send("Formato de assinatura inválido");
    }
    let sigHex = parts[1];

    let algorithm = { name: "HMAC", hash: { name: "SHA-256" } };

    let keyBytes = encoder.encode(secret);
    let extractable = false;
    let key = await crypto.subtle.importKey("raw", keyBytes, algorithm, extractable, ["sign", "verify"]);

    let sigBytes = hexToBytes(sigHex);
    let dataBytes = encoder.encode(payload);
    let equal = await crypto.subtle.verify(algorithm.name, key, sigBytes, dataBytes);

    if (!equal) {
      console.log("Git Notifications:🔐 Assinatura inválida.");
      return res.status(401).send("Assinatura inválida");
    }

    next();
  } catch (error) {
    console.error("Git Notifications:❌ Erro na verificação de assinatura:", error);
    return res.status(500).send("Erro interno na verificação de assinatura");
  }
}



function hexToBytes(hex) {
  let len = hex.length / 2;
  let bytes = new Uint8Array(len);

  let index = 0;
  for (let i = 0; i < hex.length; i += 2) {
    let c = hex.slice(i, i + 2);
    let b = parseInt(c, 16);
    bytes[index] = b;
    index += 1;
  }

  return bytes;
}
