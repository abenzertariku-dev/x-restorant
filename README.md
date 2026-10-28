# X-Restorant (Restaurant Table & Delivery Platform)

Modern full-stack restaurant platform with dine-in QR ordering, delivery management, waiter station, and manager portal.

## 📁 Project Architecture

```
x-restorant/
├── backend/               # Express.js REST & Real-time SSE API (Port 5000)
│   ├── src/
│   │   ├── server.js      # Express server & API endpoints
│   │   ├── auth.js        # PIN verification & cookie-based role auth
│   │   └── store.js       # Data persistence & SSE event emitters
│   ├── .env.example
│   └── package.json
│
├── frontend/              # Next.js (App Router) + TypeScript + Tailwind (Port 3000)
│   ├── src/
│   │   └── app/           # Pages & UI routes
│   ├── next.config.ts     # Configured with /api proxy rewrite to backend
│   ├── .env.local.example
│   └── package.json
│
└── package.json           # Root scripts to run both servers
```

---

## 🚀 Quick Start

### 1. Start the Backend (Express on port 5000)
```bash
npm run dev:backend
# Or: cd backend && npm run dev
```

### 2. Start the Frontend (Next.js on port 3000)
```bash
npm run dev:frontend
# Or: cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables & Roles

- Default Staff PINs:
  - **Waiter**: `1111` (`/ord/wait`)
  - **Manager**: `2222` (`/admin/mang`)
  - **Driver**: `3333` (`/rot/dlivery`)
- Keys are configured in `backend/.env`. Change them before deploying to production.
