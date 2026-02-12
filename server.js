/**
 * LABP-Stack Backend
 * Production-grade API with observability
 */

const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");

const app = express();

/* ========================
   Middleware
======================== */

app.use(cors());
app.use(express.json());

/* Request Tracing + Logging */
app.use((req, res, next) => {
  const requestId = randomUUID();
  req.id = requestId;

  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    const log = {
      request_id: requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: duration,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      timestamp: new Date().toISOString()
    };

    console.log(JSON.stringify(log));
  });

  next();
});

/* ========================
   Routes
======================== */

/* Healthcheck */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "labp-backend",
    version: "1.0.0"
  });
});

/* Intent API */
app.post("/analyze", (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({
      error: "Missing text",
      request_id: req.id
    });
  }

  const normalized = text.toLowerCase();

  let intent = "UNKNOWN";
  let response = "Sorry, I didn't understand that.";

  if (normalized.includes("price")) {
    intent = "PRICING";
    response = "Our pricing starts from $X depending on your needs.";
  }

  if (normalized.includes("hello") || normalized.includes("hi")) {
    intent = "GREETING";
    response = "Hello! How can I help you?";
  }

  res.json({
    request_id: req.id,
    intent,
    response
  });
});

/* ========================
   Error Handler
======================== */

app.use((err, req, res, next) => {
  console.error(
    JSON.stringify({
      request_id: req.id,
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    })
  );

  res.status(500).json({
    error: "Internal Server Error",
    request_id: req.id
  });
});

/* ========================
   Server
======================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    JSON.stringify({
      event: "server_started",
      port: PORT,
      timestamp: new Date().toISOString()
    })
  );
});

