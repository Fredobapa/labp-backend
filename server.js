const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "labp-backend" });
});

// Core endpoint
app.post("/analyze", (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({
      error: "Missing 'text' field in request body",
    });
  }

  let intent = "UNKNOWN";
  let response = "Sorry, I didn't understand that.";

  const normalized = text.toLowerCase();

  if (normalized.includes("price") || normalized.includes("pricing")) {
    intent = "PRICING";
    response = "Our pricing starts from $X depending on your needs.";
  } else if (normalized.includes("hello") || normalized.includes("hi")) {
    intent = "GREETING";
    response = "Hello! How can I help you today?";
  }

  res.json({
    intent,
    response,
  });
});

// 🔑 Railway-compatible port binding
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});

