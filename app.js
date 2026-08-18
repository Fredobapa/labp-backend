const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");

const app = express();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "16kb" }));

app.use((req, res, next) => {
  req.id = randomUUID();
  const start = Date.now();

  res.on("finish", () => {
    console.log(
      JSON.stringify({
        request_id: req.id,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration_ms: Date.now() - start,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        timestamp: new Date().toISOString()
      })
    );
  });

  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "labp-backend",
    version: "1.0.0"
  });
});

app.post("/analyze", (req, res) => {
  const { text } = req.body;

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({
      error: "Text must be a non-empty string",
      request_id: req.id
    });
  }

  const normalized = text.toLowerCase();
  let intent = "UNKNOWN";
  let response = "Sorry, I didn't understand that.";

  if (/\bprice\b/.test(normalized)) {
    intent = "PRICING";
    response = "Pricing information is not configured in this prototype.";
  } else if (/\b(hello|hi)\b/.test(normalized)) {
    intent = "GREETING";
    response = "Hello! How can I help you?";
  }

  return res.json({
    request_id: req.id,
    intent,
    response
  });
});

app.use((err, req, res, next) => {
  const status = Number.isInteger(err.status) ? err.status : 500;

  console.error(
    JSON.stringify({
      request_id: req.id,
      error: err.message,
      stack: status >= 500 ? err.stack : undefined,
      timestamp: new Date().toISOString()
    })
  );

  res.status(status).json({
    error: status >= 500 ? "Internal Server Error" : "Invalid request",
    request_id: req.id
  });
});

module.exports = app;
