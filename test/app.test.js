const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../app");

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

async function analyze(text) {
  const response = await fetch(`${baseUrl}/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text })
  });

  return { response, body: await response.json() };
}

test("health endpoint describes the service", async () => {
  const response = await fetch(`${baseUrl}/`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    status: "ok",
    service: "labp-backend",
    version: "1.0.0"
  });
  assert.equal(response.headers.get("x-powered-by"), null);
});

test("classifies the pricing keyword", async () => {
  const { response, body } = await analyze("I want to know the price");

  assert.equal(response.status, 200);
  assert.equal(body.intent, "PRICING");
  assert.match(body.request_id, /^[0-9a-f-]{36}$/);
});

test("classifies a greeting as a complete word", async () => {
  const greeting = await analyze("Hi there");
  const substring = await analyze("This should not be a greeting");

  assert.equal(greeting.body.intent, "GREETING");
  assert.equal(substring.body.intent, "UNKNOWN");
});

test("returns UNKNOWN for unsupported requests", async () => {
  const { response, body } = await analyze("I need technical support");

  assert.equal(response.status, 200);
  assert.equal(body.intent, "UNKNOWN");
});

test("rejects missing, empty, and non-string text", async () => {
  for (const text of [undefined, "", "   ", 42]) {
    const { response, body } = await analyze(text);

    assert.equal(response.status, 400);
    assert.equal(body.error, "Text must be a non-empty string");
    assert.match(body.request_id, /^[0-9a-f-]{36}$/);
  }
});
