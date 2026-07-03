# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Presento** is a full-stack e-commerce gift store with a React frontend and Node.js/Express backend. The repo is split into two independent packages: `backend/` and `frontend/`.

---

## Commands

### Backend (`/backend`)
```bash
npm run dev        # Start with nodemon (hot-reload)
npm start          # Start production server (port 4000)
npm run seed       # Run seed.js to seed the database
```

Database/Prisma:
```bash
npx prisma migrate dev    # Run migrations (creates/updates DB schema)
npx prisma generate       # Regenerate Prisma client after schema changes
npx prisma studio         # Open Prisma Studio GUI
```

### Frontend (`/frontend`)
```bash
npm run dev        # Vite dev server (port 5173)
npm run build      # Production build → dist/
npm run preview    # Preview production build
npm run lint       # ESLint check
```

---

## Architecture

### Backend
- **Entry point**: `backend/index.js` — sets up Express 5, CORS (allows `localhost:5173`, `localhost:3000`, and `FRONTEND_URL` env var), and mounts all routes under `/api/*`.
- **ORM**: Prisma with MySQL (`DATABASE_URL` env var). Client singleton at `backend/prisma/client.js`.
- **Auth**: JWT-based. `authMiddleware.js` verifies `Bearer` tokens; `adminMiddleware.js` checks `isAdmin` on the decoded JWT. Must be chained: `auth, adminMiddleware`.
- **Media uploads**: Multer (memory storage) → Cloudinary. Two upload configs: `utils/productMediaUpload.js` (products) and `utils/reviewMediaUpload.js` (reviews). Product images stored as first URL in `imageUrl` field + full JSON array in `images` field.
- **Emails**: Nodemailer via `utils/sendEmail.js`. Triggered on order creation, out-for-delivery status, and cancellation (fire-and-forget — errors are caught but don't fail the request).

### API Routes
| Route | Auth | Description |
|---|---|---|
| `POST /api/auth/login` | public | Email/password login |
| `POST /api/auth/signup` | public | User registration |
| `GET /api/auth/me` | user | Get current user |
| `GET /api/products` | public | Paginated product list (`?page=&limit=`) |
| `GET /api/products/:id` | public | Single product |
| `POST /api/products` | admin | Create product (multipart: `images[]`, `video`, optional `image` for legacy) |
| `PUT /api/products/:id` | admin | Update product; send `keepImages` JSON array to retain existing Cloudinary URLs |
| `DELETE /api/products/:id` | admin | Delete product (also deletes OrderItems) |
| `PUT /api/products/:id/stock` | admin | Update stock only |
| `GET /api/orders` | admin | All orders |
| `GET /api/orders/user/:userId` | user | Orders for a specific user |
| `POST /api/orders` | user | Place order (stock check + decrement in a Prisma transaction) |
| `PUT /api/orders/:orderId` | admin | Update status; cancelling restores stock |
| `GET /api/addresses` | user | User addresses |
| `POST /api/addresses` | user | Save address |
| `GET /api/reviews/product/:productId` | public | Reviews for a product |
| `POST /api/reviews` | user | Submit review (only allowed if order with that product is `delivered`) |
| `PUT /api/reviews/:id` | user | Edit own review |
| `DELETE /api/reviews/:id` | user | Delete own review |
| `GET /api/analytics/summary` | admin | KPIs, sales charts, top products (`?range=7d\|30d\|3m\|all`) |

### Order Status Flow
`pending` → `placed` → `ready` → `out_for_delivery` → `delivered` | `cancelled`

Cancelling any non-cancelled order restores stock for all items.

### Frontend
- **Entry point**: `frontend/src/main.jsx` wraps the app in `BrowserRouter` + `CartProvider`.
- **Routing** (`App.jsx`):
  - Admin-only routes (`/admin/*`) — wrapped in `<AdminRoute>`, no shared layout.
  - User-facing routes (`/`, `/shop`, `/products/:id`, etc.) — wrapped in `<AppLayout>` (provides Navbar + Footer).
  - Protected user routes (`/cart`, `/checkout`, `/profile`, `/orders`, `/chat`) — wrapped in `<ProtectedRoute>`.
- **Auth state**: JWT token and user object stored in `localStorage` under keys `token` and `user`. `ProtectedRoute` checks `token`; `AdminRoute` also checks `user.isAdmin`.
- **Cart**: Managed by `CartContext` (see `context/CartContext.jsx`). Persisted to `localStorage` under key `presento-cart`. Delivery is free for orders > ₹499, otherwise ₹499.
- **Data fetching**: `hooks/useProducts.js` and `hooks/useOrders.js` are custom hooks used in pages.
- **Analytics page** (`/admin/analytics`): Uses Recharts for charts; data from `GET /api/analytics/summary`.

### Database Models (Prisma / MySQL)
- **User**: `id, name, email, password, isAdmin, provider` (email | google)
- **Product**: `id, name, description, shortDescription, price, discount, stock, category, imageUrl, images (JSON array), videoUrl, badge, sku, isFeatured`
- **Order**: `id, userId, status, message, items[]`
- **OrderItem**: `orderId, productId, quantity, price` (price snapshotted at order time)
- **Review**: `userId + productId` unique; `rating, comment, photos (JSON array), video`; only users with a `delivered` order containing that product can submit.
- **Address**: delivery address saved per user

### Environment Variables (backend `.env`)
```
DATABASE_URL           # MySQL connection string
JWT_SECRET             # JWT signing key
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
GOOGLE_CLIENT_ID       # For Google OAuth
GOOGLE_CLIENT_SECRET
EMAIL_HOST             # SMTP (default: smtp.gmail.com)
EMAIL_PORT             # Default: 587
EMAIL_USER
EMAIL_PASSWORD         # Gmail app password
ADMIN_EMAIL            # Email that receives order notifications
FRONTEND_URL           # Production frontend URL (added to CORS allowlist)
PORT                   # Default: 4000
```

---

## Key Patterns & Gotchas

- **Product images**: The `imageUrl` field always holds the first image URL (primary thumbnail). `images` field holds a JSON-serialized array of all image URLs. Parse with `JSON.parse(product.images)` when needed.
- **Review photos**: Same pattern — `photos` is a JSON-serialized array in the DB; always parse before returning or using.
- **Legacy image field**: Product upload routes accept both `image` (single, legacy) and `images[]` (multi). The route normalizes `image` → `images` before processing.
- **Admin check is client-side too**: `AdminRoute` reads `user.isAdmin` from localStorage — this is purely a UX guard. Real authorization is enforced server-side by `adminMiddleware`.
- **No test suite**: `npm test` exits with an error. There are no automated tests.
- **Google OAuth**: The `google-auth-library` and `passport-google-oauth20` packages are installed but the auth route (`routes/auth.js`) only implements email/password. Google login is handled on the frontend via `@react-oauth/google`.
