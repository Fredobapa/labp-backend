# labp-backend

Small Node.js/Express API prototype used by the LABP-Stack portfolio.

Requires Node.js 18 or newer.

## What it does

- `GET /` returns a basic service health response.
- `POST /analyze` accepts `{ "text": "..." }`.
- Text containing `price` returns `PRICING`.
- Text containing `hello` or `hi` returns `GREETING`.
- Other text returns `UNKNOWN`.
- Each request receives a UUID and produces a structured console log.
- A Node.js test suite verifies the current API contract.

This is deterministic keyword matching. It does not use an LLM, NLP model, vector database, automation platform, or voice system.

## Run locally

```bash
npm install
npm start
```

The service listens on `PORT`, defaulting to `3000`.

Run the tests with:

```bash
npm test
```

```bash
curl http://localhost:3000/

curl -X POST http://localhost:3000/analyze \
  -H 'Content-Type: application/json' \
  -d '{"text":"hello"}'
```

## Current limitations

- No authentication or rate limiting
- Permissive CORS configuration
- No persistence
- No model-based intent classification or confidence score
- No deployment configuration or Infrastructure as Code in this repository
- Public Railway URL previously referenced by LABP-Stack is currently unavailable

## Status

Learning prototype. It should not be described as production-ready.
