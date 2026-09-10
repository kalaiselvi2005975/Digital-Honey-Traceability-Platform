<div align="center">

# 🍯 HoneyTrace

### *From Hive to Bottle. Verified.*

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH_2026-Problem_Statement_26021-orange?style=for-the-badge&logo=shield)](https://sih.gov.in)
[![Django](https://img.shields.io/badge/Backend-Django_REST_5.0-092E20?style=for-the-badge&logo=django)](https://djangoproject.com)
[![React](https://img.shields.io/badge/Frontend-React_18_|_Vite_|_TS-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![Solidity](https://img.shields.io/badge/Blockchain-Hardhat_|_EVM_|_Web3-363636?style=for-the-badge&logo=solidity)](https://hardhat.org)

<p align="center">
  <b>A comprehensive, tamper-evident Honey Traceability and Quality Verification Platform.</b><br/>
  Empowering beekeepers, verifying supply chains with SHA-256 hash chains & EVM Smart Contracts, and delivering instant QR-code proof of purity to consumers.
</p>

[Key Features](#-key-features) • [Architecture](#-system-architecture) • [Quick Start](#-quick-start) • [API Reference](#-api-reference) • [Blockchain Proofs](#-blockchain--smart-contracts) • [Testing](#-testing)

---

</div>

## 📌 Executive Summary

Adulteration and lack of supply chain transparency severely impact the honey industry worldwide. **HoneyTrace** solves this problem by establishing an end-to-end cryptographic and immutable record of honey from the origin apiary to the final consumer bottle.

Developed for **Smart India Hackathon (SIH) 2026 — Problem Statement 26021 (Honey Chain)**, this platform combines:
1. **IoT & Beekeeper Telemetry**: Hive inspection, health metrics, and production forecasting.
2. **SHA-256 Cryptographic Hash Chain**: Tamper-evident ledger linking harvests, processing, lab testing, and packaging events.
3. **EVM Smart Contracts**: On-chain verification of batch integrity via Hardhat / Ethereum networks.
4. **Consumer Transparency Portal**: Instant, zero-install QR code scanning for public authenticity verification.

---

## ✨ Key Features

| Domain | Feature | Description |
| :--- | :--- | :--- |
| 🧑‍🌾 **Beekeeper Dashboard** | Hive Management | Track hive counts, bee colony health, inspection observations, and harvests. |
| 🔮 **AI Analytics** | Predictive Health & Yield | Rule-based baseline analytics forecasting production output and health warnings. |
| ⛓️ **Cryptographic Traceability** | Dual-Layer Ledger | Off-chain PostgreSQL store paired with SHA-256 event-hashing and EVM blockchain registration. |
| 🏷️ **QR Verification** | Consumer Transparency | Dynamic QR code generation linking directly to the batch's immutable audit history. |
| 🔐 **Enterprise Security** | JWT Authentication | Role-based access control separating Beekeeper management from Public audit routes. |
| 🐳 **DevOps Ready** | Dockerized Environment | Containerized multi-service orchestration (`docker-compose`) for instant deployment. |

---

## 🏗️ System Architecture

```
                                  +-----------------------+
                                  |   Consumer / Auditor  |
                                  +-----------+-----------+
                                              |
                                              | (QR Scan / Public Verification)
                                              v
+------------------------+        +-----------------------+
|  Beekeeper Dashboard   |        |   React 18 Frontend   |
| (React + TS + Tailwind)| <====> |   (Vite + Lucide UI)  |
+------------------------+        +-----------+-----------+
                                              |
                                              | REST API + JWT
                                              v
                                  +-----------------------+
                                  |  Django REST Backend  |
                                  +-----+-----------+-----+
                                        |           |
             +--------------------------+           +--------------------------+
             |                                                                 |
             v                                                                 v
+------------------------+                                           +-------------------+
|  PostgreSQL Database   |                                           | Web3.py Blockchain|
| (SHA-256 Hash Chain)   |                                           |  Contract Service |
+------------------------+                                           +---------+---------+
                                                                               |
                                                                               | JSON-RPC (EVM)
                                                                               v
                                                                     +-------------------+
                                                                     |  Hardhat / EVM    |
                                                                     |  Smart Contract   |
                                                                     +-------------------+
```

### Data Integrity Architecture
* **PostgreSQL Store**: Holds complete domain entities (Hives, Inspections, Harvests, Processing steps, Lab Reports).
* **Cryptographic Hash Chain**: Every status update generates a SHA-256 hash incorporating the previous event's hash (`PrevHash + Payload -> CurrentHash`).
* **Blockchain Anchor**: On critical milestones (e.g., Packaging), the batch ID, event type, and cryptographic hash are anchored on-chain via the `HoneyTrace.sol` smart contract.

---

## 🚀 Quick Start

### Prerequisites
Ensure you have the following installed on your local machine:
* **Node.js**: `v20.x` or higher
* **Python**: `v3.11` or higher
* **npm** or **pnpm**
* **Docker & Docker Compose** *(Optional, for containerized run)*

---

### 🛠️ Option 1: Standard Local Setup

#### 1. Backend Setup (Django REST)
```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Environment Setup
cp .env.example .env

# Run migrations & seed demo dataset
python manage.py migrate
python manage.py seed_demo

# Start Development Server
python manage.py runserver
```
* **API Base URL**: `http://localhost:8000/api/`
* **Swagger API Docs**: `http://localhost:8000/api/docs/`

---

#### 2. Frontend Setup (React + Vite)
Open a new terminal window:
```bash
# In project root directory
npm install
cp .env.example .env

# Start Vite Dev Server
npm run dev
```
* **Web App URL**: `http://localhost:5173`

---

#### 3. Blockchain Network Setup (Optional for EVM Proofs)
Open a third terminal window:
```bash
cd blockchain

# Install Hardhat dependencies
npm install

# Spin up local EVM node (:8545)
npx hardhat node
```

In another terminal window, deploy the contract:
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

Copy the output contract address and private key into `backend/.env`:
```env
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
BLOCKCHAIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
HONEYTRACE_CONTRACT_ADDRESS=<DEPLOYED_CONTRACT_ADDRESS>
BLOCKCHAIN_NETWORK=hardhat
```

---

### 🐳 Option 2: Docker Compose Setup

Run the entire stack (Database, Backend, Frontend, Blockchain) with a single command:

```bash
docker-compose up --build
```

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Beekeeper** | `beekeeper@demo.com` | `beekeeper123` | Full Dashboard & Hive CRUD |
| **Customer / Public** | *N/A (Public)* | *N/A* | Public Verification Page (`/batch/HN001`) |

* **Pre-configured Verified Batch**: `HN001` (Full verified hash chain)
* **Partial Batch**: `HN002` (In-progress batch)

---

## 📡 API Endpoints Overview

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login/` | Public | Authenticate user & return JWT tokens |
| `GET` | `/api/auth/me/` | JWT | Get current authenticated user details |
| `GET/POST` | `/api/hives/` | Beekeeper | List & register new hives |
| `GET` | `/api/hives/{id}/health/` | Beekeeper | Retrieve AI-driven health diagnostic |
| `GET` | `/api/hives/{id}/forecast/` | Beekeeper | Get production yield predictions |
| `GET/POST` | `/api/batches/` | Beekeeper | Manage honey batches |
| `POST` | `/api/batches/{id}/processing/` | Beekeeper | Log processing step & update hash chain |
| `POST` | `/api/batches/{id}/packaging/` | Beekeeper | Finalize batch & record on Blockchain |
| `GET` | `/api/public/batches/{id}/` | **Public** | Fetch verified batch trail for consumer scan |

---

## 🔬 Testing & Verification

Execute test suites across all project layers to verify system integrity:

```bash
# Test Backend Django REST API
cd backend && python manage.py test

# Test Smart Contracts (Hardhat)
cd blockchain && npx hardhat test

# Build Frontend TypeScript validation
npm run build
```

---

## 📁 Repository Directory Layout

```
sih-honey-traceability/
├── backend/                  # Django REST Framework Service
│   ├── accounts/             # Authentication & User Management
│   ├── hives/                # Apiary & Hive Telemetry Management
│   ├── harvests/             # Harvest Events & Quantity Logs
│   ├── batches/              # Batch Processing & QR Generation
│   ├── traceability/         # SHA-256 Hash Chain Implementation
│   ├── blockchain/           # Web3.py Blockchain Service Integrations
│   └── ai_services/          # Analytics & Predictive Algorithms
├── blockchain/               # Ethereum Smart Contracts (Hardhat)
│   ├── contracts/            # HoneyTrace.sol Smart Contract
│   ├── scripts/              # Automated Deployment Scripts
│   └── test/                 # Smart Contract Unit Tests
├── src/                      # Frontend Application (React 18 + TS)
│   ├── components/           # Reusable UI Components
│   ├── pages/                # Route Page Views
│   └── services/             # Axios API Clients
├── docker-compose.yml        # Multi-container Deployment Manifest
└── README.md                 # Project Documentation
```

---

## 🏆 SIH 2026 Project Details

* **Problem Statement**: PS-26021 (Honey Chain Traceability)
* **Event**: Smart India Hackathon 2026
* **Domain**: Agriculture, Supply Chain Security & Blockchain

---

<div align="center">
  <b>Built with ❤️ for SIH 2026</b><br/>
  <i>Ensuring Honey Purity Through Innovation and Cryptography.</i>
</div>
