const app = require("./app");

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
