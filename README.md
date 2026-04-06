# AI Options Pro (Stock Option AWS Deployment)

An advanced, multi-AI powered Indian Stock Market analysis dashboard built with a component-based Angular frontend and a robust Node.js/Express backend. It aggregates and orchestrates insights from the world's leading language models to provide trading insights, option strategies, and daily market briefings.

---

## 🚀 **Technology Stack & Versions**

### **Frontend**
*   **Framework:** Angular `^18.2.0`
*   **Language:** TypeScript `~5.5.2`
*   **Styling:** Custom CSS with Global Theme Tokens (Light/Dark Mode Support)
*   **RxJS:** `~7.8.0`

### **Backend**
*   **Runtime:** Node.js
*   **Framework:** Express `^5.2.1`
*   **Database ORM:** Mongoose `^9.2.3` (MongoDB)
*   **Language:** TypeScript `^5.9.3`

### **Integrated AI Models (Services)**
The platform runs parallel analyses by asynchronously orchestrating the following SDKs:
*   **Google Gemini** (`@google/genai ^1.43.0`): Gemini 2.5 Flash
*   **OpenAI ChatGPT** (`openai ^6.25.0`): GPT-4o-Mini
*   **Anthropic Claude** (`@anthropic-ai/sdk ^0.78.0`): Claude 3.5 Sonnet
*   **DeepSeek** (`openai ^6.25.0` via base URL): DeepSeek-Chat (V3)

---

## 📂 **Project Directory Structure**

The project is structured as a monorepo containing two deeply separated architectures:

### **1. Backend (`/backend`)**
```text
backend/
├── src/
│   ├── config/           # Environment and MongoDB Atlas setup
│   ├── controllers/      # Request handlers (e.g., `recommendations.controller.ts`)
│   ├── middleware/       # Global error handling and Winston request mapping
│   ├── models/           # Mongoose Database Schemas (e.g., `top-picks.model.ts`)
│   ├── routes/           # Express API Router endpoints
│   ├── services/         # Dedicated AI SDK Wrappers (`gemini`, `claude`, etc.)
│   └── utils/            # Winston Loggers and massively complex AI JSON System Prompts
├── .env                  # Environment Variables (Ignored in Git)
├── package.json          # Node dependencies
└── tsconfig.json         # TypeScript compiler configurations
```

### **2. Frontend (`/frontend`)**
```text
frontend/
├── src/
│   ├── app/
│   │   ├── core/         # Core application services and interceptors
│   │   ├── features/     # Feature modules (Lazy-Loaded: Home, Top-Picks, Search, Admin)
│   │   ├── shared/       # Reusable UI component cards and layout directives
│   │   ├── app.module.ts # Core Application Bootstrap
│   │   └── app-routing.module.ts # Main URL Router Mapping
│   ├── environments/     # Environment-specific variables (e.g., API Base URLs)
│   └── styles.css        # Global CSS root elements and Light/Dark mode variables
├── package.json          # Angular dependencies
└── angular.json          # Angular CLI configuration setup
```

---

## 🛠️ **How to Run the Project Locally**

### **Prerequisites**
*   Node.js installed (v18+ recommended)
*   MongoDB Atlas URI (or local MongoDB connection)
*   API Keys for: Google Gemini, OpenAI, Anthropic, and DeepSeek.

### **Step 1: Start the Backend Server**
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` root directory and add your credentials:
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/test?retryWrites=true&w=majority
   FRONTEND_URL=http://localhost:4200
   
   # AI Master Keys
   GEMINI_API_KEY=your_gemini_key
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_claude_key
   DEEPSEEK_API_KEY=your_deepseek_key
   ```
4. Start the development server (runs with hot-reloading via `ts-node-dev`):
   ```bash
   npm run dev
   ```
   *The backend will be running on [http://localhost:3000](http://localhost:3000).*

### **Step 2: Start the Frontend Application**
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Angular CLI development server:
   ```bash
   npm start
   ```
   *The Angular UI will compile and serve on [http://localhost:4200](http://localhost:4200).*

Open your browser to `http://localhost:4200` to interact with the dashboard.
