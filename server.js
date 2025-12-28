const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/analyze", (req, res) => {
  const text = (req.body.text || "").toLowerCase();

  let intent = "UNKNOWN";
  let response = "I'm not sure I understood. Could you please rephrase?";

  if (text.includes("price") || text.includes("cost")) {
    intent = "PRICING";
    response = "Our pricing starts from $X depending on your needs.";
  } else if (text.includes("open") || text.includes("time") || text.includes("hour")) {
    intent = "AVAILABILITY";
    response = "We are available from 9am to 6pm.";
  } else if (text.includes("help") || text.includes("support")) {
    intent = "SUPPORT";
    response = "Sure, I can help you. Please describe your issue.";
  }

  res.json({ intent, response });
});

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});

