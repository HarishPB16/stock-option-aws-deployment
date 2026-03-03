# Gemini AI Stock Options Backend

This is the Node.js/Express backend powering the Enterprise Stock Options analyzer. It leverages Google Gemini AI to analyze stock parameters and return categorized trading insights securely and asynchronously.

## 🏗 Directory Structure
```
backend/
├── src/
│   ├── config/          # DocumentDB connection logic
│   ├── routes/          # API Routing Definitions
│   ├── controllers/     # Route request handlers
│   ├── services/        # Business Logic / Gemini AI Integration
│   ├── models/          # Mongoose Schema Definitions
│   ├── middleware/      # Security, Logging, and Rate limiting hooks
│   ├── validators/      # Schema/Payload validation logic
│   ├── utils/           # Winston logger and formatters
│   ├── app.ts           # Express Application definition (Middlewares)
│   └── server.ts        # Bootstrapper (Port binding & DB conn)
├── logs/                # Winston Output (error, security, combined)
├── ecosystem.config.js  # PM2 cluster mode scaling config
├── Dockerfile           # Production Node deployment setup
└── tsconfig.json        # Strict TypeScript compiler options
```

## 🛡 Security Implementations
- **Helmet**: Secures Express apps by setting 15+ HTTP response headers.
- **HPP (HTTP Parameter Pollution)**: Protects against parameter pollution attacks by ignoring duplicate query string attributes.
- **Payload Limits**: `express.json` is strictly restricted to `10kb` payloads.
- **Prompt Injection Defense**: Endpoints cleanly drop unauthorized complex structures. System AI prompts are completely isolated from user input.
- **Winston Security Logging**: All validation failures and Rate Limit trips immediately output to `logs/security.log`.
- **Express Rate-Limit**: Enforces an API Gateway-style burst mitigation natively (100 hits / 15 mins per IP).

## ⚡ Performance Optimizations
- **In-Memory/Local Fallback**: Automatically spins up `mongodb-memory-server` in development mode.
- **DocumentDB Connection Pooling**: `db.config.ts` forces a `minPoolSize=2` and `maxPoolSize=10` with `retryWrites=true` for heavy scale.
- **TTL Indices**: Mongo schema natively sweeps 30-day-old queries without manual cron jobs.
- **PM2 Clustering**: `ecosystem.config.js` is optimized for memory thresholds.
- **Asynchronous Flow**: Uses only Async/Await without ANY synchronous blocking flows.

## 🚀 How to Run Locally

### Approach 1: Bare Metal (Node.js)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server (auto-detects local memory Mongo):
   ```powershell
   $env:GEMINI_API_KEY="your_api_key_here"; npm run dev
   ```

### Approach 2: Docker / Containerized
If using Docker, start the system from the *project root directory*:
```bash
GEMINI_API_KEY="your_api_key" docker-compose up --build
```
