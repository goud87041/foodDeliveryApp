# Food Delivery — Full Stack

React (Vite) + Tailwind customer and admin apps, Node/Express + MongoDB + Socket.io + JWT backend.

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a `MONGODB_URI` connection string)

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

API: `http://localhost:5000`  
Demo admin (after seed): **Admin ID** `ADM-DEMO`, **password** `admin123`  
Demo delivery logins (seed): `vikram@delivery.com` / `delivery123`

### 2. Customer app (`frontend/user`)

```bash
cd frontend/user
npm install
npm run dev
```

Open `http://localhost:5173`. API calls use the Vite proxy to port 5000.

### 3. Admin app (`frontend/admin`)

```bash
cd frontend/admin
npm install
npm run dev
```

Open `http://localhost:5174`.

### 4. Delivery partner app (`frontend/delivery`)

```bash
cd frontend/delivery
npm install
npm run dev
```

Open `http://localhost:5175`. Partners log in with email/password (seed accounts e.g. `vikram@delivery.com` / `delivery123`). They can **accept** or **reject** new offers and view full order details (customer, address, items, maps link).

Ensure `CLIENT_ORIGINS` in backend `.env` includes your **local** and **deployed** frontend URLs (see below).

## Local vs deployed (CORS + API URLs)

### Local development (default)
- Frontends: `npm run dev` on ports **5173 / 5174 / 5175**
- Backend: `npm run dev` on **5000**
- Leave frontend `VITE_*` env vars **empty** — Vite proxies `/api` and `/uploads` to the backend
- Backend allows `localhost` and `127.0.0.1` on any port automatically

### Production (split deploy — e.g. Vercel + Render)

**Backend `.env`:**
```env
CLIENT_ORIGINS=https://your-user-app.vercel.app,https://your-admin-app.vercel.app,https://your-delivery-app.vercel.app
# Optional: allow all Vercel preview URLs
CLIENT_ORIGIN_PATTERNS=^https://.*\.vercel\.app$
```

**Each frontend** (set in hosting dashboard before build):
```env
VITE_API_URL=https://your-api.onrender.com/api
VITE_SOCKET_URL=https://your-api.onrender.com
```

Restart/redeploy the backend after changing `CLIENT_ORIGINS`.

## Environment

| App | Variables |
|-----|-----------|
| Backend | `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGINS`, `CLIENT_ORIGIN_PATTERNS`, `CORS_ALLOW_LOCALHOST` |
| Frontends | `VITE_API_URL`, `VITE_SOCKET_URL` (only needed when API is on a different host than the UI) |

If Razorpay keys are omitted, checkout marks orders paid in **mock** mode for local development.

## Project layout

```
foodwebapp/
  backend/            Express API, models, Socket.io
  frontend/user/      Customer UI
  frontend/admin/     Admin UI
  frontend/delivery/  Delivery partner UI (accept / reject offers)
```

## Food images (admin)

- Admin **Foods** form: **Choose image** uploads a file to `POST /api/admin/upload/image` (multipart field `image`, admin JWT).
- Files are stored under `backend/uploads/` and served at `GET /uploads/<filename>` (public).
- Vite dev servers proxy `/uploads` to the API. For production, set `VITE_API_URL` (e.g. `https://api.yoursite.com/api`) so `/uploads/...` paths resolve to the same host as the API.

## Features (summary)

- JWT auth (users, admins, delivery partners)
- Orders, automatic delivery assignment when status becomes `out_for_delivery` (partner must **accept**; reject rotates offer to another partner when possible)
- Real-time order and delivery location events (Socket.io)
- Reviews (food, delivery, restaurant) with admin moderation
- Razorpay-ready payment flow
- Admin dashboard with Recharts

## API highlights

- `POST /api/auth/register` · `POST /api/auth/login`
- `POST /api/admin/auth/login` (body: `adminId`, `password`)
- `GET /api/foods` · `GET /api/orders/mine` (user JWT)
- `PATCH /api/orders/admin/:id/status` (admin JWT)
- `POST /api/admin/upload/image` (admin JWT, multipart `image`) → `{ url: "/uploads/..." }`
- `GET /api/reviews/order/:orderId` (user JWT — your reviews for that order)
- `GET /api/delivery/orders` · `POST /api/delivery/orders/:id/accept` · `POST /api/delivery/orders/:id/reject` (delivery JWT)
