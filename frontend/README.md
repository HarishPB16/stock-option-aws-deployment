# Gemini AI Stock Options Frontend

This is the Angular web interface for the Gemini Stock Options analyzer. It features a modern, responsive, glassmorphic dark-mode UI that processes structured data directly from the Node.js API.

## 🏗 Directory Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                  # Singleton Services and Interceptors
│   │   │   ├── interceptors/      # Global HTTP Error interceptors
│   │   │   └── services/          # Data fetching logic (OptionsService)
│   │   ├── features/              # Feature Modules
│   │   │   └── options/           # Lazy-loaded options dashboard UI
│   │   ├── app.module.ts          # Root application context
│   │   ├── app.component.ts       # Root html router wrapper
│   │   └── app-routing.module.ts  # Root router definition
│   ├── environments/              # Env switching (Dev / Prod URLs)
│   ├── styles.css                 # Global CSS variables, fonts, dark mode parameters
│   └── index.html                 # App host page
├── nginx.conf                     # Production Nginx reverse-proxy rules
└── Dockerfile                     # Multi-stage optimized Nginx build
```

## 🛡 Security Implementations
- **Strict Typing Checks**: Compiled globally with typescript strict mode avoiding anomalous logic execution.
- **HTTP Interceptors**: `http-error.interceptor.ts` acts as a shield mapping any RateLimit (429) or Validation (400) failures uniformly protecting the end-state UI.
- **Angular Context Isolation**: Natively prevents Cross-Site Scripting (XSS) via Angular's DOM sanitizers handling AI output.

## ⚡ Performance Optimizations
- **Lazy Loaded Feature Modules**: The Options Dashboard is decoupled from `app.module`. It only downloads the Javascript chunk if the user hits the `/options` path.
- **OnPush Change Detection**: Presentation components bypass cyclical Angular checks, only re-rendering when the input observables concretely shift values (e.g. `this.cdr.markForCheck()`).
- **Nginx GZIP Compressions**: Native configuration inside `nginx.conf` compressing Javascript payloads (`gzip_min_length 10240;`).
- **AOT & Build Optimization**: Docker targets compile explicitly with `--configuration production` triggering tree-shaking and Ahead-of-Time angular compilation.

## 🚀 How to Run Locally

### Approach 1: Node.js (via Angular CLI)
Ensure dependencies are built. The application natively defaults to targeting the `http://localhost:3000` backend in local mode.
```bash
npm install
npm start
```
Go to http://localhost:4200.

### Approach 2: Docker / Containerized
If using Docker, start the system from the *project root directory* to boot the custom Nginx Alpine image alongside the backend:
```bash
GEMINI_API_KEY="your_api_key" docker-compose up --build
```
Go to http://localhost:80.
