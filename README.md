# 🌾 Gram Mitra (Rural Connect) — Cloud, DevOps & API Infrastructure

[![AWS EC2](https://img.shields.io/badge/Cloud-AWS%20EC2-FF9900?logo=amazonec2&logoColor=white)](https://aws.amazon.com/ec2/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-kubeadm%20%7C%20Flannel-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-ak3806%2Fgram--mitra--backend-2496ED?logo=docker&logoColor=white)](https://hub.docker.com/r/ak3806/gram-mitra-backend)
[![Jenkins CI/CD](https://img.shields.io/badge/CI%2FCD-Jenkins%20Pipeline-D24939?logo=jenkins&logoColor=white)](https://www.jenkins.io/)
[![SonarQube](https://img.shields.io/badge/Code%20Quality-SonarQube-4E9BCD?logo=sonarqube&logoColor=white)](https://www.sonarqube.org/)
[![Prometheus](https://img.shields.io/badge/Monitoring-Prometheus-E6522C?logo=prometheus&logoColor=white)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Dashboard-Grafana-F46800?logo=grafana&logoColor=white)](https://grafana.com/)
[![Helm](https://img.shields.io/badge/Packaging-Helm-0F1689?logo=helm&logoColor=white)](https://helm.sh/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Jest](https://img.shields.io/badge/Testing-Jest%20%26%20Supertest-C21325?logo=jest&logoColor=white)](https://jestjs.io/)

> **Gram Mitra (Rural Connect)** is an end-to-end rural empowerment and agricultural support platform connecting farmers and village communities with healthcare, veterinary services, government welfare schemes, grievance redressal, produce marketplaces, and AI-powered bilingual voice mentors.

This repository contains the **complete application codebase**, **REST API services**, **database schemas**, and the **production-grade DevOps, Cloud, Kubernetes, CI/CD, SonarQube Code Quality, and Observability infrastructure** powering the Gram-Mitra platform.

---

## 📑 Table of Contents

- [🚀 DevOps & Cloud Architecture Overview](#-devops--cloud-architecture-overview)
- [🛠️ DevOps & Platform Technology Stack](#️-devops--platform-technology-stack)
- [☁️ AWS Cloud Infrastructure](#️-aws-cloud-infrastructure)
- [☸️ Kubernetes Cluster Architecture](#️-kubernetes-cluster-architecture)
- [🐳 Docker Containerization & Docker Hub](#-docker-containerization--docker-hub)
- [🔍 SonarQube Code Quality & Security Analysis](#-sonarqube-code-quality--security-analysis)
- [🔄 Jenkins CI/CD Automation Pipeline](#-jenkins-cicd-automation-pipeline)
- [📊 Monitoring & Observability Stack (Prometheus & Grafana)](#-monitoring--observability-stack-prometheus--grafana)
- [🗄️ Database Architecture & Supabase PostgreSQL](#️-database-architecture--supabase-postgresql)
- [🌟 Platform Application Modules](#-platform-application-modules)
- [📁 Repository & Directory Layout](#-repository--directory-layout)
- [⚙️ Environment Configuration](#️-environment-configuration)
- [📡 Complete REST API Reference](#-complete-rest-api-reference)
- [🧪 Testing & Quality Assurance](#-testing--quality-assurance)
- [🚀 Quick Start & Operations Runbook](#-quick-start--operations-runbook)
- [❓ Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🚀 DevOps & Cloud Architecture Overview

The Gram-Mitra backend is packaged as a containerized service published to **Docker Hub** (`ak3806/gram-mitra-backend:latest`), analyzed with **SonarQube**, orchestrated on a **Kubernetes cluster hosted on an AWS EC2 instance**, automated via a **Jenkins CI/CD Pipeline**, and monitored in real-time with **Prometheus, Grafana, Alertmanager, and Node Exporter**.

```text
                         ┌────────────────────────────────────────┐
                         │           Developer Workstation        │
                         │           GitHub Repository (Push)     │
                         └───────────────────┬────────────────────┘
                                             │
                                             ▼
                         ┌────────────────────────────────────────┐
                         │             Jenkins Server             │
                         │           (Automated CI/CD)            │
                         │  - SCM Checkout                        │
                         │  - npm ci (Install Dependencies)       │
                         │  - npm test (Jest / Supertest Suite)   │
                         └───────────────────┬────────────────────┘
                                             │
                                             ▼
                         ┌────────────────────────────────────────┐
                         │               SonarQube                │
                         │     Code Quality & Security Scan       │
                         │     (Quality Gate Verification)        │
                         └───────────────────┬────────────────────┘
                                             │ [Quality Gate Passed]
                                             ▼
                         ┌────────────────────────────────────────┐
                         │         Docker Build & Package         │
                         │   ak3806/gram-mitra-backend:latest     │
                         └───────────────────┬────────────────────┘
                                             │
                                             ▼
                         ┌────────────────────────────────────────┐
                         │              Docker Hub                │
                         │           Container Registry           │
                         └───────────────────┬────────────────────┘
                                             │
                                             ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                    AWS EC2 INSTANCE                                    │
  │                                                                                        │
  │  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
  │  │                            Kubernetes Cluster (kubeadm)                          │  │
  │  │                           Container Network Interface (Flannel)                  │  │
  │  │                                                                                  │  │
  │  │  ┌────────────────────────────────────────────────────────────────────────────┐  │  │
  │  │  │             Gram-Mitra Backend Workload (Deployment: 2 Replicas)           │  │  │
  │  │  │                                                                            │  │  │
  │  │  │   ┌─────────────────────────────┐        ┌─────────────────────────────┐   │  │  │
  │  │  │   │  Pod 1: gram-mitra-backend  │        │  Pod 2: gram-mitra-backend  │   │  │  │
  │  │  │   │  (Port 5000 | Node.js/Exp)  │        │  (Port 5000 | Node.js/Exp)  │   │  │  │
  │  │  │   └──────────────┬──────────────┘        └──────────────┬──────────────┘   │  │  │
  │  │  └──────────────────┼──────────────────────────────────────┼──────────────────┘  │  │
  │  │                     └──────────────────┬───────────────────┘                     │  │
  │  │                                        ▼                                         │  │
  │  │                      Kubernetes Service: NodePort 30442                          │  │
  │  │                       (Routes traffic to Pods on Port 5000)                      │  │
  │  │                                                                                  │  │
  │  │  ┌────────────────────────────────────────────────────────────────────────────┐  │  │
  │  │  │                         Monitoring & Observability                         │  │  │
  │  │  │                                                                            │  │  │
  │  │  │  ┌─────────────────────┐    Scrapes     ┌───────────────────────────────┐  │  │  │
  │  │  │  │   Node Exporter     │ ─────────────► │          Prometheus           │  │  │  │
  │  │  │  │ kube-state-metrics  │    Metrics     │       (TSDB & Queries)        │  │  │  │
  │  │  │  └─────────────────────┘                └───────────────┬───────────────┘  │  │  │
  │  │  │                                                         │                  │  │  │
  │  │  │                                                         ▼                  │  │  │
  │  │  │                                         ┌───────────────────────────────┐  │  │  │
  │  │  │                                         │      Grafana Dashboards       │  │  │  │
  │  │  │                                         │    (Visualization & Alerts)   │  │  │  │
  │  │  │                                         └───────────────────────────────┘  │  │  │
  │  │  └────────────────────────────────────────────────────────────────────────────┘  │  │
  │  └────────────────────────────────────────┬─────────────────────────────────────────┘  │
  └───────────────────────────────────────────┼────────────────────────────────────────────┘
                                              │
                         ┌────────────────────┴───────────────────┐
                         │                                        │
                         ▼                                        ▼
             ┌────────────────────────┐              ┌────────────────────────┐
             │  Supabase PostgreSQL   │              │   External Public APIs │
             │  (Cloud Hosted DB &    │              │   - data.gov.in Schemes│
             │   Auth / Storage RLS)  │              │   - Vapi AI Voice Web  │
             └────────────────────────┘              └────────────────────────┘
```

---

## 🛠️ DevOps & Platform Technology Stack

| Category | Technology | Version / Specification | Purpose |
|---|---|---|---|
| **Source Control** | **GitHub** | Git Distributed SCM | Source repository, branch protection, commit hooks |
| **CI/CD Automation** | **Jenkins** | Declarative Pipeline | Continuous Integration, automated testing, image builds, zero-downtime deployment |
| **Code Quality / SAST**| **SonarQube** | Static Analysis Engine | Code quality verification, vulnerability scanning, code smell detection & Quality Gate |
| **Container Engine** | **Docker** | Node 22-Alpine Multi-Stage | Lightweight, reproducible containerization of Node.js / Express backend |
| **Image Registry** | **Docker Hub** | `ak3806/gram-mitra-backend` | Centralized container image storage and distribution |
| **Cloud Provider** | **AWS EC2** | Ubuntu Linux Instance | High-availability cloud compute host for the Kubernetes cluster |
| **Orchestration** | **Kubernetes** | `kubeadm` v1.28+ | High-availability container scheduling, auto-healing, and scaling |
| **Pod Networking** | **Flannel CNI** | `10.244.0.0/16` CIDR | Layer 3 overlay network fabric for inter-pod routing |
| **Package Manager**| **Helm** | Helm v3 | Package management for monitoring charts (`kube-prometheus-stack`) |
| **Metrics Engine** | **Prometheus** | Core Server + Alertmanager | Pull-based timeseries scraping for CPU, memory, HTTP request latencies |
| **Visualization**  | **Grafana** | Web UI Dashboards | Real-time monitoring panels for Kubernetes nodes, pods, and application metrics |
| **Cluster Metrics**| **kube-state-metrics** | v2.x | Generates health and deployment metrics from Kubernetes API objects |
| **Host Metrics**   | **Node Exporter** | DaemonSet | Collects hardware and OS-level metrics from the EC2 host |
| **Cluster CLI**    | **kubectl** | CLI | Primary administrative tool for manifest application and cluster management |
| **Database**       | **Supabase** | PostgreSQL 15+ | Managed relational database with connection pooling and Row-Level Security |
| **Application**    | **Node.js / Express** | Node.js 18+ / Express 4.21.2 | Layered RESTful backend with Helmet, CORS, and Morgan |
| **Testing**        | **Jest & Supertest**| Jest 29.7 / Supertest 7.0 | Automated integration test coverage across all domain modules |

---

## ☁️ AWS Cloud Infrastructure

The infrastructure runs on an **AWS EC2 instance** configured as the host node for the Kubernetes cluster:

```text
AWS Cloud
└── EC2 Instance (Ubuntu Server)
    ├── Container Runtime (containerd)
    ├── Kubernetes Control Plane & Worker Node (Single-Node/Multi-Node Setup)
    ├── Networking (Flannel Overlay CNI)
    ├── Gram-Mitra Backend (Deployment with 2 Replicas, NodePort Service)
    └── Observability Stack (Prometheus, Grafana, Node Exporter, kube-state-metrics)
```

### AWS Security Group Configuration

To allow external access to the application, monitoring tools, and management consoles, the following inbound rules are provisioned on AWS:

| Port / Range | Protocol | Source | Purpose |
|---|---|---|---|
| `22` | TCP | SSH Admin IP | Secure shell server administration |
| `80` / `443` | TCP | `0.0.0.0/0` | Web HTTP/HTTPS reverse proxy traffic |
| `5000` | TCP | Cluster Internal | Gram-Mitra container internal listener |
| `30442` | TCP | `0.0.0.0/0` | **Kubernetes NodePort Service** (Gram-Mitra Backend public endpoint) |
| `8080` | TCP | Admin IP | Jenkins Web Dashboard |
| `9000` | TCP | Admin IP | SonarQube Server Web Dashboard & API |
| `9090` | TCP | Admin IP | Prometheus Server Dashboard |
| `3000` | TCP | Admin IP | Grafana Metrics & Alerting Dashboard |
| `6443` | TCP | Cluster Nodes | Kubernetes API Server endpoint |

---

## ☸️ Kubernetes Cluster Architecture

The Kubernetes cluster was initialized using standard **`kubeadm`** with pod overlay networking:

```bash
sudo kubeadm init --pod-network-cidr=10.244.0.0/16
```

Cluster network routing is powered by **Flannel CNI**:

```bash
kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml
```

### Kubernetes Resources Breakdown

All production manifests are maintained in [`k8s/`](file:///c:/Users/kirve/OneDrive/Desktop/gram-mitra/backend/k8s):

1. **Deployment ([`k8s/deployment.yaml`](file:///c:/Users/kirve/OneDrive/Desktop/gram-mitra/backend/k8s/deployment.yaml))**:
   - **Replicas**: 2 pods for zero-downtime availability and load distribution.
   - **Container Image**: `ak3806/gram-mitra-backend:latest`
   - **Resource Requests & Limits**:
     - Requests: `100m` CPU, `128Mi` RAM
     - Limits: `500m` CPU, `512Mi` RAM
   - **Health Probes**:
     - **Readiness Probe**: HTTP GET `/api/v1/health` on port 5000 (initial delay: 5s, period: 10s).
     - **Liveness Probe**: HTTP GET `/` on port 5000 (initial delay: 10s, period: 15s).
   - **Configuration Mapping**: Injects application settings from `ConfigMap` and secrets from `Secret`.

2. **Service ([`k8s/service.yaml`](file:///c:/Users/kirve/OneDrive/Desktop/gram-mitra/backend/k8s/service.yaml))**:
   - **Type**: `NodePort`
   - **NodePort**: `30442`
   - **Port**: `5000` ➔ **TargetPort**: `5000`
   - Accessible on EC2 via `http://<EC2-PUBLIC-IP>:30442/api/v1/health`.

3. **ConfigMap ([`k8s/configmap.yaml`](file:///c:/Users/kirve/OneDrive/Desktop/gram-mitra/backend/k8s/configmap.yaml))**:
   - Stores non-sensitive runtime configurations (`PORT=5000`, `NODE_ENV=production`, `APP_NAME`, `API_VERSION`).

4. **Secret ([`k8s/secret.yaml`](file:///c:/Users/kirve/OneDrive/Desktop/gram-mitra/backend/k8s/secret.yaml))**:
   - Stores base64-encoded credentials (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATA_GOV_API_KEY`, `VAPI_PUBLIC_KEY`, `JWT_SECRET`).

---

## 🐳 Docker Containerization & Docker Hub

The application utilizes a lightweight multi-stage Docker build based on **`node:22-alpine`** for minimal image footprint and fast startup times.

### Dockerfile Highlights
```dockerfile
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000
CMD ["node", "src/server.js"]
```

### Docker Hub Publishing Workflow

```text
Local / Jenkins Node
        │
        ▼
   docker build -t ak3806/gram-mitra-backend:latest .
        │
        ▼
   docker login -u ak3806 -p <DOCKER_HUB_TOKEN>
        │
        ▼
   docker push ak3806/gram-mitra-backend:latest
        │
        ▼
   Kubernetes Nodes pull image on rollout
```

### Standalone Docker Execution
```bash
# Pull and run container directly from Docker Hub:
docker run -d \
  --name gram-mitra-backend \
  -p 5000:5000 \
  --env-file .env \
  ak3806/gram-mitra-backend:latest
```

---

## 🔍 SonarQube Code Quality & Security Analysis

To enforce clean code, high test coverage, and prevent security vulnerabilities, **SonarQube** is integrated into the development lifecycle and the Jenkins CI/CD pipeline.

### SonarQube Configuration (`sonar-project.properties`)

The project configuration file [`sonar-project.properties`](file:///c:/Users/kirve/OneDrive/Desktop/gram-mitra/backend/sonar-project.properties) specifies key scanning metrics:

```ini
sonar.projectKey=gram-mitra-backend
sonar.projectName=Gram Mitra Backend
sonar.projectVersion=1.0.0

# Source & Test Code Directories
sonar.sources=src
sonar.tests=tests
sonar.sourceEncoding=UTF-8
sonar.language=js

# Exclusions
sonar.exclusions=node_modules/**,coverage/**,k8s/**,logs/**,scratch/**
sonar.test.inclusions=tests/**/*.test.js,tests/**/*.spec.js

# Test Coverage & Execution Reports
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.testExecutionReportPaths=test-report.xml
```

### Quality Gate Criteria

The pipeline enforces a strict **Quality Gate**:
- **Bugs**: 0 Blocker or Critical bugs.
- **Vulnerabilities**: 0 High or Critical vulnerabilities (Security Rating: A).
- **Security Hotspots**: 100% reviewed.
- **Code Smells & Technical Debt**: Maintainability Rating: A.
- **Duplication**: Under 3% code duplication across modules.
- **Coverage**: Minimum 80% line and branch test coverage.

### Running Sonar Scanner Manually
```bash
# Generate Jest coverage report
npm test -- --coverage

# Execute SonarQube Scanner CLI
sonar-scanner \
  -Dsonar.host.url=http://<SONARQUBE-IP>:9000 \
  -Dsonar.login=<SONARQUBE_TOKEN>
```

---

## 🔄 Jenkins CI/CD Automation Pipeline

Continuous Integration and Continuous Deployment are orchestrated via a declarative **[`Jenkinsfile`](file:///c:/Users/kirve/OneDrive/Desktop/gram-mitra/backend/Jenkinsfile)** ensuring every commit undergoes strict automated testing and static quality gating before reaching production:

```text
 ┌─────────────┐     ┌─────────────────────┐     ┌──────────────┐     ┌────────────────────┐
 │ 1. Checkout │ ──► │ 2. npm Dependencies │ ──► │ 3. Unit Test │ ──► │ 4. SonarQube Scan  │
 └─────────────┘     └─────────────────────┘     └──────────────┘     └─────────┬──────────┘
                                                                                │
 ┌──────────────────────┐     ┌───────────────────┐     ┌─────────────────┐     │ [Quality Gate OK]
 │ 8. Rollout Status OK │ ◄── │ 7. K8s Manifests  │ ◄── │ 6. Docker Push  │ ◄───┤
 └──────────────────────┘     └───────────────────┘     └─────────────────┘     │ 5. Docker Build
```

### Pipeline Stages Breakdown

1. **Stage 1: Checkout**: Pulls latest commit from the active Git branch via SCM.
2. **Stage 2: Install Dependencies**: Executes `npm ci` for fast, reproducible dependency resolution.
3. **Stage 3: Automated Testing**: Executes `npm test` running the Jest & Supertest integration suite with coverage tracking.
4. **Stage 4: SonarQube Quality Analysis**:
   - Executes SonarQube Scanner using `withSonarQubeEnv('SonarQube-Server')`.
   - Halts pipeline if the **Quality Gate** fails (`waitForQualityGate()`), preventing buggy or vulnerable code from proceeding.
5. **Stage 5: Docker Build**: Packages the application into Docker image `ak3806/gram-mitra-backend:latest`.
6. **Stage 6: Registry Distribution**: Pushes image to Docker Hub or loads directly into the local Kubernetes container runtime.
7. **Stage 7: Deploy to Kubernetes**: Applies manifests (`configmap.yaml`, `secret.yaml`, `deployment.yaml`, `service.yaml`) and triggers a rolling update:
   ```bash
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/secret.yaml
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   kubectl rollout restart deployment/gram-mitra-backend
   ```
8. **Stage 8: Verification**: Monitored by `kubectl rollout status deployment/gram-mitra-backend --timeout=120s`. Automatically rolls back if pods fail readiness probes.

---

## 📊 Monitoring & Observability Stack (Prometheus & Grafana)

The production cluster is monitored using the Kubernetes-native **Prometheus & Grafana** observability stack installed via Helm:

```bash
# Helm installation of kube-prometheus-stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

### Monitoring Stack Components

- **Prometheus Server**: Scrapes cluster metrics every 15 seconds, storing CPU, memory, network I/O, and HTTP request metrics in a time-series database.
- **Node Exporter**: Runs as a `DaemonSet` on the EC2 instance collecting OS-level telemetry (load average, disk saturation, memory leaks).
- **kube-state-metrics**: Monitors Kubernetes object states (pod restarts, pending pods, replica availability, deployment rollout progression).
- **Grafana**: Interactive visualization dashboards configured to monitor:
  - **Kubernetes Cluster Overview**: Overall CPU and memory reservation across nodes.
  - **Pod Performance**: Resource consumption of `gram-mitra-backend` pods across the 2 replicas.
  - **Network & Request Rates**: HTTP status codes, latency, and traffic volume.
- **Alertmanager**: Triggers alerts for pod crash loops, memory threshold breaches (>80%), or probe failures.

---

## 🗄️ Database Architecture & Supabase PostgreSQL

Gram-Mitra utilizes **PostgreSQL hosted on Supabase**. All DDL scripts, relationship constraints, check validations, performance indexes, and automatic triggers are defined in [`src/db/schema.sql`](file:///c:/Users/kirve/OneDrive/Desktop/gram-mitra/backend/src/db/schema.sql).

### Entity Relationship Diagram

```mermaid
erDiagram
    PROFILES ||--o{ VILLAGE_PROBLEMS : "reports"
    PROFILES ||--o{ PROBLEM_UPDATES : "updates"
    PROFILES ||--o{ PRODUCTS : "lists"
    PROFILES ||--o{ ORDERS : "places as buyer"
    PROFILES ||--o{ ORDERS : "fulfills as seller"
    HOSPITALS ||--o{ HOSPITAL_SERVICES : "provides"
    VILLAGE_PROBLEMS ||--o{ PROBLEM_UPDATES : "tracks history"
    PRODUCTS ||--o{ ORDERS : "purchased in"
```

### Table Schema Summary

| Table | Primary Key | Description & Key Columns |
|---|---|---|
| `profiles` | `id` (UUID references `auth.users`) | Extended user profiles (`full_name`, `phone`, `email`, `age`, `state`, `district`, `village`, `profile_image_url`). |
| `hospitals` | `id` (UUID) | Human & veterinary facilities (`name`, `type` [`human` \| `animal`], `address`, `district`, `state`, `latitude`, `longitude`, `phone`, `is_emergency`, `is_active`). |
| `hospital_services` | `id` (UUID) | Clinical services (`hospital_id` FK, `service_name`, `description`, `available`). |
| `village_problems` | `id` (UUID) | Grievance tickets (`reported_by` FK, `title`, `description`, `category` [`water`, `road`, `electricity`, `agriculture`, `healthcare`, `sanitation`, `animal`, `other`], `status` [`reported`, `under_review`, `in_progress`, `resolved`, `rejected`], `priority` [`low`, `medium`, `high`, `urgent`], coordinates). |
| `problem_updates` | `id` (UUID) | Chronological status history (`problem_id` FK, `updated_by` FK, `status`, `comment`, `image_url`). |
| `products` | `id` (UUID) | Farmer marketplace listings (`seller_id` FK, `name`, `category`, `price`, `unit`, `quantity`, `is_available`, `district`, `state`). |
| `orders` | `id` (UUID) | Marketplace orders (`product_id` FK, `buyer_id` FK, `seller_id` FK, `quantity`, `unit_price`, `total_price`, `status`, `payment_method`, `payment_status`). |
| `ngos` | `id` (UUID) | Accredited partner NGOs (`name`, `category`, `phone`, `email`, `address`, `district`, `state`, `services`, `is_active`). |
| `myths` | `id` (UUID) | Myth vs Fact entries (`title`, `myth`, `fact`, `explanation`, `category`, `language`, `source`, `is_verified`). |

---

## 🌟 Platform Application Modules

1. **🏥 Rural Healthcare & Veterinary Network**:
   - Dual directory of Human Hospitals (PHCs, CHCs, Civil Hospitals) and Veterinary Clinics.
   - Real-time GPS radius search using Haversine formula calculation.
   - 24/7 Emergency Facilities & National Helplines: `108` (Ambulance), `102` (Mother & Child), `104` (Health Advice), `1962` (Veterinary Emergency), `112` (National All-in-One Emergency).
2. **📢 Village Grievance Redressal**:
   - Geotagged issue submission for rural infrastructure problems.
   - Status transitions with full historical audit logs.
3. **🏛️ Government Schemes Integration**:
   - Live query integration with **data.gov.in** PM-KISAN dataset with resilient in-memory caching and fallbacks.
   - Curated directory for PMAY-G, MGNREGA, PMFBY, Ayushman Bharat.
4. **🌾 Farmer Produce Marketplace**:
   - Direct farmer-to-buyer transactions.
   - Real-time stock validation, automated inventory deduction, and cancellation inventory rollback.
5. **🤝 Partner NGOs Directory**:
   - Search non-profits by domain (agriculture, water conservation, education, women empowerment).
6. **💡 Myth vs Fact (Superstition Buster)**:
   - Debunking rural misconceptions with verified medical, agricultural, and scientific citations.
7. **🎙️ AI Voice Mentor Assistant**:
   - Bilingual voice interface powered by Vapi Web SDK for low-literacy rural accessibility.

---

## 📁 Repository & Directory Layout

```text
backend/
├── src/
│   ├── server.js               # Entry point, HTTP listener & graceful shutdown handlers
│   ├── app.js                  # Express application setup, security headers & route mounting
│   ├── config/                 # Environment & Supabase initialization
│   ├── controllers/            # Request handlers & validation logic
│   ├── routes/                 # Express Router modular definitions (/api/v1)
│   ├── services/               # Core business logic & external integrations
│   ├── models/                 # Database table schema constants
│   ├── middleware/             # Auth (requireAuth/optionalAuth), Error Handler, 404
│   ├── utils/                  # Structured logger & standardized JSON formatters
│   ├── db/
│   │   └── schema.sql          # PostgreSQL DDL (Tables, Indexes, Triggers)
│   └── scripts/
│       └── test-db.js          # Supabase connectivity & schema check script
├── tests/                      # Jest & Supertest integration test suite
├── k8s/                        # Kubernetes production manifests
│   ├── configmap.yaml          # ConfigMap (runtime environment parameters)
│   ├── deployment.yaml         # Deployment (2 Replicas, Probes, Limits)
│   ├── secret.yaml             # K8s Secrets (Supabase, API tokens)
│   ├── secret.example.template # Secret template for base64 encoding
│   └── service.yaml            # NodePort Service (Port 5000 -> 30442)
├── Dockerfile                  # Lightweight Node 22-Alpine container image
├── docker-compose.yml          # Local multi-container Docker runner
├── docker-compose.jenkins.yml  # Jenkins runner configuration
├── Jenkinsfile                 # 8-stage automated CI/CD pipeline with SonarQube & K8s
├── JENKINS_SETUP.md            # Complete Jenkins setup & configuration guide
├── sonar-project.properties    # SonarQube code quality & SAST configuration
├── .env.example                # Environment variables template
└── package.json                # Project dependencies & npm scripts
```

---

## ⚙️ Environment Configuration

Create `.env` in `backend/` by copying `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=production
APP_NAME=Gram Mitra Backend
API_VERSION=v1
CORS_ORIGIN=*

# Database / Supabase Configuration
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]

# Government Schemes API (data.gov.in)
DATA_GOV_API_KEY=[YOUR-DATA-GOV-KEY]
DATA_GOV_BASE_URL=https://api.data.gov.in/resource
DATA_GOV_RESOURCE_ID=388208c6-d82a-4190-90df-91aa2c326fec
DATA_GOV_CACHE_TTL_MS=600000

# Vapi AI Voice Agent
VAPI_PUBLIC_KEY=[YOUR-VAPI-KEY]
VAPI_ASSISTANT_ID=[YOUR-VAPI-ASSISTANT-ID]
VAPI_SERVER_SECRET=[YOUR-WEBHOOK-SECRET]
```

---

## 📡 Complete REST API Reference

All routes are mounted under `/api/v1` (with `/` available for root health checks).

### System & Health Endpoints
- `GET /` — Root service verification (`200 OK`)
- `GET /api/v1/health` — System status, uptime, and memory diagnostics (`200 OK`)

### Authentication & Profiles (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Register user with email/phone & profile
- `POST /api/v1/auth/login` — Sign in and receive JWT token
- `GET /api/v1/auth/me` — Fetch authenticated user profile *(Bearer Auth)*
- `PUT /api/v1/auth/me` — Update user profile details *(Bearer Auth)*
- `POST /api/v1/auth/logout` — Invalidate user session *(Bearer Auth)*

### Healthcare & Veterinary Directory (`/api/v1/healthcare`)
- `GET /api/v1/healthcare` — Browse all facilities (filters: `type`, `district`, `search`, `radius`)
- `GET /api/v1/healthcare/nearby` — Real-time GPS search (`lat`, `lng`, `radius` in km)
- `GET /api/v1/healthcare/emergency` — 24/7 facilities and national emergency helplines
- `GET /api/v1/healthcare/hospitals` — List human hospitals, PHCs, & CHCs
- `POST /api/v1/healthcare/hospitals` — Register a human hospital
- `GET /api/v1/healthcare/veterinary` — List animal clinics & dispensaries
- `POST /api/v1/healthcare/veterinary` — Register a veterinary facility
- `GET /api/v1/healthcare/services/catalog` — Curated rural health programs

### Village Problems & Grievances (`/api/v1/village-problems`)
- `POST /api/v1/village-problems` — Report a village problem with coordinates & category
- `GET /api/v1/village-problems` — Query tickets (filters: `status`, `priority`, `district`, `village`)
- `GET /api/v1/village-problems/stats` — Resolution rate & category statistics
- `PATCH /api/v1/village-problems/:id/status` — Advance status (`reported` ➔ `in_progress` ➔ `resolved`)
- `GET /api/v1/village-problems/:id/history` — Chronological audit trail of updates

### Government Schemes (`/api/v1/schemes`)
- `GET /api/v1/schemes` — Live PM-KISAN village beneficiary records from data.gov.in
- `GET /api/v1/schemes/catalog` — Flagship rural schemes catalog (PMAY-G, MGNREGA, PMFBY)
- `GET /api/v1/schemes/stats` — Aggregated beneficiary metrics

### Farmer Marketplace (`/api/v1/marketplace`)
- `GET /api/v1/marketplace/products` — Browse produce with filters (`category`, `price`, `district`)
- `POST /api/v1/marketplace/products` — Publish new produce listing
- `POST /api/v1/marketplace/orders` — Place order with atomic stock deduction
- `PATCH /api/v1/marketplace/orders/:id/status` — Advance order state (`pending` ➔ `delivered`)
- `DELETE /api/v1/marketplace/orders/:id` — Cancel order with automatic stock rollback

### Partner NGOs (`/api/v1/ngos`)
- `GET /api/v1/ngos` — Directory of non-profit partners
- `GET /api/v1/ngos/categories` — Categories with distribution metrics
- `POST /api/v1/ngos` — Register new partner NGO

### Myth vs Fact (`/api/v1/superstitions`)
- `GET /api/v1/superstitions` — Myth vs Fact entries
- `GET /api/v1/superstitions/random` — Random Myth of the Day
- `PATCH /api/v1/superstitions/:id/verify` — Verify entry with scientific citation

### AI Voice Mentor (`/api/v1/voice`)
- `POST /api/v1/voice/session` — Initialize Vapi Web Call session
- `GET /api/v1/voice/config` — Retrieve mentor configurations
- `POST /api/v1/voice/webhook` — Vapi webhook listener for call reports & tool calls

---

## 🧪 Testing & Quality Assurance

Integration tests validate all endpoints and logic using **Jest** and **Supertest**:

```bash
# Run complete test suite
npm test

# Run tests with code coverage output for SonarQube
npm test -- --coverage

# Run a specific domain suite
npx jest tests/healthcare.test.js
npx jest tests/marketplace.test.js
npx jest tests/problem.test.js
```

---

## 🚀 Quick Start & Operations Runbook

### 1. Local Development
```bash
# 1. Install dependencies
npm install

# 2. Check Supabase connection
npm run db:check

# 3. Start development server with auto-reload
npm run dev
```

### 2. Kubernetes Deployment on AWS EC2
```bash
# 1. Apply Kubernetes ConfigMap & Secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# 2. Deploy Gram-Mitra Backend (2 Replicas) & NodePort Service
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# 3. Verify Rollout & Pod Status
kubectl get pods -l app=gram-mitra-backend -o wide
kubectl get service gram-mitra-backend-service

# 4. Access Backend via NodePort 30442
curl http://<AWS-EC2-PUBLIC-IP>:30442/api/v1/health
```

---

## ❓ Troubleshooting & FAQs

### Q1: SonarQube Quality Gate fails during Jenkins build
- Check the Jenkins Console Output and your SonarQube project dashboard at `http://<SONARQUBE-IP>:9000`.
- Address any blocker/critical bugs or missing test coverage in your source code.
- Ensure `coverage/lcov.info` is generated before scanner execution by running `npm test -- --coverage`.

### Q2: Pods are in `CrashLoopBackOff` status
- Run `kubectl describe pod <pod-name>` and `kubectl logs <pod-name>` to inspect startup errors.
- Ensure `k8s/secret.yaml` has valid base64-encoded strings for `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### Q3: Cannot access NodePort 30442 from outside AWS
- Check your **AWS EC2 Security Group** inbound rules. Ensure port `30442` is open for TCP traffic from `0.0.0.0/0`.
- Verify the NodePort service is running: `kubectl get svc gram-mitra-backend-service`.

### Q4: Prometheus is not discovering Gram-Mitra pods
- Verify the pods have proper labels (`app: gram-mitra-backend`).
- Add a `ServiceMonitor` or pod annotation in `deployment.yaml` (`prometheus.io/scrape: "true"`, `prometheus.io/port: "5000"`).

---

## 📄 License & Attribution

- **Project**: Gram Mitra (Rural Connect)
- **License**: ISC
- **Docker Image**: [`ak3806/gram-mitra-backend:latest`](https://hub.docker.com/r/ak3806/gram-mitra-backend)
- **Data Source**: Open Government Data (OGD) Platform India ([data.gov.in](https://data.gov.in))
