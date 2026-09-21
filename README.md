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
│   │   └── health.service.js  # Business logic & external service integrations
│   ├── models/
│   │   └── index.js           # Database models placeholder
│   ├── middleware/
│   │   ├── errorHandler.js    # Global error handler
│   │   └── notFound.js        # 404 handler
│   └── utils/
│       ├── logger.js          # Structured logger
│       └── response.js        # Standardized API response format
├── tests/
│   └── health.test.js         # Jest & Supertest integration tests
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
| `GET` | `/api/v1/schemes` | Government schemes & NGO resources | `200 OK` |
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
