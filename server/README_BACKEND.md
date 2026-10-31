# NEXORA Backend Server

This is the dedicated Node.js and Express backend server for **NEXORA: Ideas Meet Opportunity**.

---

## 🛠 Features

- **Authentication Endpoints**: Registration and Login with role selection (`/api/auth/register`, `/api/auth/login`, `/api/auth/role`).
- **Google OAuth Support**: Endpoints ready for Google Identity tokens (`/api/auth/google`).
- **Ventures API**:
  - Multi-facet search and filtering by industry, funding requirements, and development stage (`/api/ventures`).
  - View counts and inquiry tracking (`/api/ventures/:id`).
  - Create and update ventures (`POST /api/ventures`, `PUT /api/ventures/:id`).
- **Sponsorship Engagement**: Express interest modal workflows (`/api/ventures/:id/express-interest`).
- **Encrypted & Protected Storage**: JSON file database persistence (`database.json`) requiring **zero external database setup**, plus hooks for PostgreSQL/MongoDB.
- **Direct Messaging**: In-app secure communication threads between entrepreneurs and sponsors (`/api/messages`).

---

## 🚀 How to Run the Backend

### Prerequisites
- Node.js (version 16.x or higher)
- npm or yarn

### 1. Install Dependencies
In terminal, navigate to this `server` directory:
```bash
cd "C:\Users\yamun\OneDrive\Desktop\Anti Gravity Projects\Nexora\server"
npm install
```

### 2. Configure Environment Variables
Create a `.env` file or copy from `.env.example`:
```bash
cp .env.example .env
```
Key configuration items:
- `PORT`: Port number (default `5000`)
- `JWT_SECRET`: Secret key for token verification
- `GOOGLE_CLIENT_ID`: If integrating Google Cloud authentication

### 3. Start the Server
```bash
npm start
```
You should see:
```
=================================================
  NEXORA BACKEND SERVER ACTIVE
  Port: 5000
  API Health: http://localhost:5000/api/health
  Database: .../database.json
=================================================
```

---

## ⚡ Dual Mode Architecture
The NEXORA frontend includes a **smart automatic adapter**:
1. When the backend server is active at `http://localhost:5000`, the frontend automatically sends live REST requests to it.
2. When running standalone in VS Code via Live Server or direct browser launch (without the Node backend running), the frontend automatically uses the built-in **IndexedDB & LocalStorage Engine** (`db.js`), preserving 100% of the interactive features, file upload simulations, multi-stage forms, and search capabilities!

