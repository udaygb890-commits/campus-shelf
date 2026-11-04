# 📚 CampusShelf: Master System Architecture & Application
**Version:** 4.0-Production-Grade  
**Platform:** Hyperlocal Peer-to-Peer Textbook & Book Exchange Platform for MVJCE  
**Scope:** MVJ College of Engineering, Channasandra, Bangalore  

---

## 🌟 Executive Summary & Core Pillars

CampusShelf is engineered exclusively for students at **MVJ College of Engineering (MVJCE)** to solve textbook accessibility, affordability, and high academic book turnover.

1. **Hyperlocal Campus Trust:** Physical handoffs are restricted to pre-approved MVJCE landmarks (`ECE Block Lobby`, `Main Library Entrance`, `CSE / ISE Block`, `Mechanical Block Gate`, `Main Auditorium Steps`).
2. **Dual-Token Economy:** Students can exchange textbooks via platform credit tokens (earned by listing books) or direct cash transactions (₹).
3. **Modern Glassmorphism UI:** Built with translucent frosted glass components (`backdrop-blur-md`, `bg-white/70`), soft diffusing shadows, deep navy branding (`#002147`), and faint campus map watermarks over an off-white canvas.
4. **Safety & Privacy First:** Zero exposure of personal phone numbers or private email addresses; all negotiation occurs via secure in-app real-time chat with masked identities (`Rahul V. (ECE, 3rd Year)`).

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Client Tier** | React (Vite) | Fast, responsive single-page application |
| **Design System** | Tailwind CSS | Custom Glassmorphic design tokens with MVJCE navy |
| **Icons & Effects** | Lucide React + Canvas Confetti | Visual cues and celebration effects on swap confirmation |
| **Backend / BaaS** | Supabase (PostgreSQL + RLS + Storage) | Managed auth, realtime events, and row-level security |
| **SQL Migrations** | PostgreSQL 15+ | Complete schema for `profiles`, `listings`, `requests`, `chats`, `messages`, `ledgers`, and `library` |

---

## 📂 Repository Structure

```
CAMPUS SHELF/
├── client/                               # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Welcome.jsx               # Public landing hero with glass CTA container
│   │   │   ├── Register.jsx              # 2-step registration with Phone OTP verification
│   │   │   ├── Auth.jsx                  # MVJCE institutional login portal + guest mode
│   │   │   ├── Onboarding.jsx            # Mandatory Department, Year & Campus Zone setup
│   │   │   ├── Sidebar.jsx               # Dark navy (#002147) collapsible accordion sidebar
│   │   │   ├── Feed.jsx                  # Main marketplace with instant search & tag pills
│   │   │   ├── BookGrid.jsx              # 4-column glass book grid with exchange badges
│   │   │   ├── ListBookModal.jsx         # Manual listing & quick-import from library
│   │   │   ├── ActiveListings.jsx        # Owner listing management & edit interface
│   │   │   ├── MyLibrary.jsx             # Personal digital shelf + AI Vision OCR assistant
│   │   │   ├── History.jsx               # Swap & Sales history with linked counterparty
│   │   │   ├── Chat.jsx                  # Privacy-preserving chat & atomic swap confirmation
│   │   │   ├── PendingRequests.jsx       # Incoming swap proposals & accept/decline actions
│   │   │   ├── CreditsLedger.jsx         # Token wallet widget & immutable audit log
│   │   │   ├── ProfileSettings.jsx       # Academic metadata, handoff spots & privacy toggle
│   │   │   ├── Logout.jsx                # Session termination confirmation dialog
│   │   │   └── Toast.jsx                 # Real-time interactive feedback banners
│   │   ├── context/
│   │   │   └── CampusShelfContext.jsx    # Central reactive state engine & Supabase sync
│   │   ├── data/
│   │   │   └── initialData.js            # Seed data for MVJCE students, books, and landmarks
│   │   ├── App.jsx                       # Master layout & responsive navigation router
│   │   ├── main.jsx                      # Vite entry point
│   │   └── index.css                     # Glassmorphic utilities & campus canvas
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env
│
├── supabase/
│   └── migrations/
│       └── 001_campus_shelf_master.sql   # Full database schema, RLS policies & atomic RPCs
│
└── README.md
```

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- pnpm or npm

### 1. Launch the Frontend
```bash
cd client
pnpm install
pnpm run dev
```
Open **`http://localhost:3000`** in your browser.

### 2. Connect Supabase (Optional)
If connecting to a live Supabase project, execute the SQL script located at:
`supabase/migrations/001_campus_shelf_master.sql`
in your Supabase SQL Editor, then update `client/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

*Note: The application has a built-in state engine with MVJCE seed data so you can test all 13 modules immediately without any external setup!*

---

## 🛡️ Security & Privacy Guarantees
- **Identity Masking:** Only `Full Name`, `Department`, and `Year` are visible to other students in chat and marketplace listings. Personal phone numbers and email addresses are never exposed.
- **Controlled Handoff:** Pick-ups must take place at official, well-lit MVJCE campus landmarks.
- **Idempotent Atomic Transactions:** Credit transfers and book status updates are guaranteed by atomic database operations.

