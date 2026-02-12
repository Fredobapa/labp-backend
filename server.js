const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

// ---------- Logger ----------
function log(level, event, data = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...data,
  };

  console.log(JSON.stringify(entry));
}

// ---------- Request Tracker ----------
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  req.startTime = Date.now();

  log("INFO", "request_received", {
    id: req.requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  res.on("finish", () => {
    const duration = Date.now() - req.startTime;

    log("INFO", "request_completed", {
      id: req.requestId,
      status: res.statusCode,
      duration_ms: duration,
    });
  });

  next();
});

// ---------- Health ----------
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "labp-backend",
  });
});

// ---------- Intent Engine ----------
function detectIntent(text) {
  const t = text.toLowerCase();

  if (t.includes("price")) {
    return {
      intent: "PRICING",
      response: "Our pricing starts from $X depending on your needs.",
    };
  }

  if (t.includes("hello") || t.includes("hi")) {
    return {
      intent: "GREETING",
      response: "Hello! How can I help you?",
    };
  }

  return {
    intent: "UNKNOWN",
    response: "Sorry, I didn't understand that.",
  };
}

// ---------- API ----------
app.post("/analyze", (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      log("WARN", "invalid_request", {
        id: req.requestId,
        reason: "missing_text",
      });

      return res.status(400).json({ error: "Missing text" });
    }

    const result = detectIntent(text);

    log("INFO", "intent_detected", {
      id: req.requestId,
      input: text,
      intent: result.intent,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ---------- Error Handler ----------
app.use((err, req, res, next) => {
  log("ERROR", "unhandled_exception", {
    id: req.requestId,
    message: err.message,
    stack: err.stack,
  });

  res.status(500).json({ error: "Internal Server Error" });
});

// ---------- Start ----------
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  log("INFO", "server_started", { port: PORT });
});
