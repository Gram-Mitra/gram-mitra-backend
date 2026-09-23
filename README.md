# Gram Mitra (Rural Connect) Backend

Backend API service built with **Node.js, Express, and JavaScript** following clean layered architecture.

---

## 📁 Architecture Overview

```text
backend/
├── src/
│   ├── server.js              # Server entry point & graceful shutdown
│   ├── app.js                 # Express application & middleware configuration
│   ├── config/
│   │   └── index.js           # Environment & application config
│   ├── controllers/
│   │   ├── health.controller.js       # Health check controller (status: OK)
│   │   ├── auth.controller.js         # Authentication logic
│   │   ├── superstition.controller.js # Myth vs Fact / Superstitions
│   │   ├── healthcare.controller.js   # Nearby hospitals & veterinary facilities
│   │   ├── problem.controller.js      # Village problem reporting & tracking
│   │   ├── voice.controller.js        # Farmer AI voice assistant
│   │   ├── scheme.controller.js       # Government schemes & NGOs
│   │   └── marketplace.controller.js  # Farmer produce marketplace
│   ├── routes/
│   │   ├── index.js           # Routes aggregator mounted at /api/v1
│   │   ├── health.routes.js
│   │   ├── auth.routes.js
│   │   ├── superstition.routes.js
│   │   ├── healthcare.routes.js
│   │   ├── problem.routes.js
│   │   ├── voice.routes.js
│   │   ├── scheme.routes.js
│   │   └── marketplace.routes.js
│   ├── services/
│   │   ├── health.service.js  # Business logic & external service integrations
│   │   └── scheme.service.js  # data.gov.in integration, caching, normalization, catalog
│   ├── models/
│   │   └── index.js           # Database models placeholder
│   ├── middleware/
│   │   ├── errorHandler.js    # Global error handler
│   │   └── notFound.js        # 404 handler
│   └── utils/
│       ├── logger.js          # Structured logger
│       └── response.js        # Standardized API response format
├── tests/
│   ├── health.test.js         # Jest & Supertest integration tests
│   └── schemes.test.js        # Government schemes live & catalog tests
├── .env.example
├── .env
├── .gitignore
├── .dockerignore
├── Dockerfile
└── package.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (already done by default):
```env
PORT=5000
NODE_ENV=development
APP_NAME=Gram Mitra Backend
API_VERSION=v1
CORS_ORIGIN=*

# data.gov.in Government Schemes
DATA_GOV_API_KEY=your_data_gov_api_key_here
DATA_GOV_BASE_URL=https://api.data.gov.in/resource
DATA_GOV_RESOURCE_ID=388208c6-d82a-4190-90df-91aa2c326fec
DATA_GOV_CACHE_TTL_MS=600000
```

### 3. Run Locally
- **Development mode** (with auto-reload):
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```
- **Run Tests**:
  ```bash
  npm test
  ```

---

## 🏛️ Government Schemes API (`/api/v1/schemes`)

Integrated with the official **data.gov.in** PM-KISAN dataset API (`https://api.data.gov.in/resource/388208c6-d82a-4190-90df-91aa2c326fec`) with automatic in-memory caching and fallback resilience.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/schemes` | Fetch live village beneficiary records (supports `limit`, `offset`, `state`, `district`, `block`, `village`, `search`, `refresh`) |
| `GET` | `/api/v1/schemes/catalog` | Curated directory of major rural schemes (PM-KISAN, PMAY-G, MGNREGA, PMFBY, Ayushman Bharat) with benefits & eligibility |
| `GET` | `/api/v1/schemes/stats` | Aggregate metrics (male, female, transgender, total beneficiaries) |
| `GET` | `/api/v1/schemes/ngos` | Directory of verified partner NGOs assisting villagers with scheme registration |
| `GET` | `/api/v1/schemes/:id` | Detailed scheme view (e.g. `pm-kisan` includes live village snapshot) |

---

## 🩺 Health Check & Core Endpoints

| Method | Endpoint | Description | Response Status |
|---|---|---|---|
| `GET` | `/` | Root verification endpoint | `200 OK` |
| `GET` | `/api/v1/health` | System health check | `200 OK` (`status: "OK"`) |
| `POST` | `/api/v1/auth/register` | User registration | `200 OK` |
| `POST` | `/api/v1/auth/login` | User login | `200 OK` |
| `GET` | `/api/v1/superstitions` | Myth vs Fact listings | `200 OK` |
| `GET` | `/api/v1/healthcare` | Nearby hospitals & animal vet services | `200 OK` |
| `GET` | `/api/v1/village-problems` | Village problems list | `200 OK` |
| `POST` | `/api/v1/voice/query` | Farmer voice assistance query | `200 OK` |
| `GET` | `/api/v1/schemes` | Government schemes & PM-KISAN live data | `200 OK` |
| `GET` | `/api/v1/marketplace/products` | Marketplace produce items | `200 OK` |

### Health Check Response Example
```json
{
  "status": "OK",
  "service": "Gram Mitra Backend",
  "environment": "development",
  "uptime": "1.42s",
  "timestamp": "2026-09-21T15:20:00.000Z"
}
```

---

## 🐳 Docker Deployment

```bash
# Build Docker image
docker build -t gram-mitra-backend:latest .

# Run container
docker run -p 5000:5000 --env-file .env gram-mitra-backend:latest
```
