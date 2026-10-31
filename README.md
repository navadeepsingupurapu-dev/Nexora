# NEXORA — Ideas Meet Opportunity

> **NEXORA** is a premier, futuristic innovation ecosystem connecting visionary entrepreneurs with accredited sponsors, angel investors, and enterprise partners. Entrepreneurs can showcase their disruptive ideas with bank-grade confidentiality and seek funding, while sponsors can discover high-potential ventures, evaluate pitch decks, and express direct sponsorship interest.

---

## 🌟 Visual Theme & Design Architecture

- **Futuristic Palette**: Deep dark navy (`#070913`) and obsidian surfaces with electric purple (`#a855f7`), tech blue (`#3b82f6`), and cyber cyan (`#06b6d4`) gradient accents.
- **Glassmorphism**: Translucent cards with frosted blur (`backdrop-filter: blur(20px)`), subtle glowing borders, and top edge reflection highlights.
- **Dynamic Atmosphere**: Interactive background canvas with moving neural connection nodes, glowing ambient orbs, and animated portal entrance doors.
- **Soft Light Auras**: Focused inputs and interactive buttons produce glowing radial auras.
- **Micro-Animations**: Custom animated checkboxes with green checkmarks, smooth step transitions, and confetti celebration triggers.

---

## 🚀 Key Functional Modules

### 1. Entrance Portal & Animated Doors
- Cyber gateway with glowing emblem and pulsing orb.
- "Enter Nexora" triggers smooth mechanical door-opening transitions into the authentication hub.
- Quick 1-click Demo Account switches for rapid walkthroughs as Sponsor or Entrepreneur.

### 2. Sign Up & Authentication with Mandatory Terms
- **Credentials & Google Auth**: Choice of Email/Phone sign up or Google Identity authentication.
- **Mandatory Terms & Conditions Checkbox**:
  - The **Continue** button starts locked and faded (`opacity: 0.35`, `pointer-events: none`).
  - Checking the box animates a green checkmark tick inside the checkbox and activates the glowing Continue button.
  - Interactive modal with standard mutual NDA terms and IP confidentiality shields.

### 3. Choose Your Journey Page
- Interactive 3D tilt cards for **Sponsor** and **Entrepreneur**.
- Dynamic role assignment and routing.

### 4. Sponsor Journey
- **Track Record Questionnaire**:
  - *Yes, I have sponsored before*: Form capturing sponsor name, previously sponsored founder, venture description, support types (Financial, Technical, Mentorship, Other), and milestone details.
  - *No, this is my first time*: Warm inspirational welcome (*"Every great idea deserves an opportunity. Let's begin your sponsorship journey!"*).
- **Sponsor Dashboard**:
  - **Discover Ideas**: Live real-time search, multi-facet filtering by industry (AI & Robotics, Greentech, Healthtech, Fintech, DeepTech, EdTech), startup stage (Idea, Research, Prototype, Developed Product), and funding thresholds.
  - **Saved Ideas**: One-click bookmarking of ventures to review later.
  - **My Sponsorships**: Tracking submitted sponsorship offers and their review statuses.
  - **Secure Founder Communications**: Real-time encrypted message threads with founders.
  - **View Details & Express Interest**: In-depth pitch modals and customized sponsorship proposal submissions.

### 5. Entrepreneur Journey (Multi-Step Wizard)
- **Step 1: Personal Details**: Full name, age, gender, email, phone, university/organization, occupation, location.
- **Step 2: Venture Information**: Venture name, domain/industry, short tagline, problem solved, proposed solution, beneficiaries, unique value proposition, development stage.
- **Step 3: Funding & Support Requirements**: Target capital ($ USD), support types needed (Financial, Technical, Mentorship, Marketing, Other), capital allocation breakdown, and expected outcome milestones.
- **Step 4: Document Vault & Drag-and-Drop**:
  - Drag-and-drop zone accepting `.pdf`, `.ppt/.pptx`, `.doc/.docx`, and images.
  - File size validation (max 25MB).
  - Granular privacy toggles per file: **Public Overview** vs **Confidential (Access upon request)**.
  - Mandatory confirmation checkbox: *"I confirm that the information submitted is accurate and that I have the right to share these documents."*
- **Step 5: Review & Submit**:
  - Structured summary card with jump-to-edit shortcuts.
  - Celebration modal: *"Your idea has officially entered Nexora. Your journey towards opportunity begins now!"*.

### 6. Entrepreneur Dashboard
- Founder metrics: Profile completion (95%), active sponsor inquiries, pitch view counter, and verification status.
- **My Venture**: Real-time live card preview.
- **Edit Venture**: Inline updates to funding goals, stage, and descriptions.
- **Documents Vault**: Manage and toggle document confidentiality settings.
- **Sponsorship Requests**: Direct inbound proposals with sponsor contacts and proposed tranches.
- **Messages**: Direct communication with interested sponsors.
- **Privacy Controls**: Mutual NDA enforcement, document locks, and contact obfuscation shields.

---

## ⚡ Dual Mode Architecture

NEXORA is engineered to run in **two modes**:

### Mode A: Standalone VS Code / Browser Mode (Zero Setup Required)
You can run NEXORA immediately in VS Code without installing any backend software or databases:
1. Open the `Nexora` folder in VS Code (`File` > `Open Folder...` > `.../Anti Gravity Projects/Nexora`).
2. Right-click [`index.html`](./index.html) and select **Open with Live Server** (or double-click `index.html` to open in any web browser).
3. The platform uses **`db.js`** (IndexedDB & LocalStorage Engine), providing:
   - Full user registration and persistent sessions.
   - Live venture creation, updates, and bookmarking.
   - Interactive document uploads and confidentiality shields.
   - Sponsor inquiries and live messaging threads.
   - Pre-seeded realistic demo ventures (NeuroSync AI, AquaBio, QuantumPulse, MediLedger).

### Mode B: Node.js + Express Backend Mode
When you want to run the dedicated REST API server:
1. Open a terminal in `server/`:
   ```bash
   cd "C:\Users\yamun\OneDrive\Desktop\Anti Gravity Projects\Nexora\server"
   npm install
   cp .env.example .env
   npm start
   ```
2. The server runs at `http://localhost:5000` with zero-config JSON database persistence (`database.json`), Multer file uploads in `server/uploads/`, and REST endpoints (`/api/auth`, `/api/ventures`, `/api/messages`).
3. The frontend automatically detects the active backend at `http://localhost:5000/api/health` and connects to it!

---

## 📁 Project File Structure

```
Nexora/
│
├── index.html              # Main single-page web app with all views and modals
├── style.css               # Futuristic cyberpunk / dark glassmorphism stylesheet
├── script.js               # Reactive application logic, stepper forms, chat, and filters
├── db.js                   # Client-side IndexedDB & persistence engine with demo data
├── README.md               # Main project documentation
│
├── assets/                 # Icons, badges, and brand media
│
└── server/                 # Dedicated Node.js Express backend
    ├── package.json        # Server dependencies (express, cors, multer, jwt)
    ├── server.js           # REST API server & database handlers
    ├── .env.example        # Environment variable configuration template
    ├── uploads/            # Server-side uploaded document directory
    └── README_BACKEND.md   # Backend installation & setup manual
```

---

## 🔑 Quick Demo Credentials

For quick evaluation, click the demo buttons on the entrance screen or use:

| Role | Email / Identifier | Purpose |
| :--- | :--- | :--- |
| **Sponsor** | `sponsor.demo@nexora.io` | Apex Horizon Capital — explore discover feed, submit sponsorship proposals, view saved ventures |
| **Entrepreneur** | `founder.demo@nexora.io` | Elena Rostova — NeuroSync AI founder dashboard, view incoming inquiries, manage vault documents |

