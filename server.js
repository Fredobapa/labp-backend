const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Health check (Railway lo necesita)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "labp-backend",
  });
});

app.post("/analyze", (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  let intent = "UNKNOWN";
  let response = "Sorry, I didn't understand that.";

  const normalized = text.toLowerCase();

  if (normalized.includes("price")) {
    intent = "PRICING";
    response = "Our pricing starts from $X depending on your needs.";
  } else if (normalized.includes("hello") || normalized.includes("hi")) {
    intent = "GREETING";
    response = "Hello! How can I help you?";
  }

  res.json({ intent, response });
});

// 🔑 CLAVE PARA RAILWAY (ESTO ES LO QUE FALTABA)
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend listening on port ${PORT}`);
});

