# Brasmora

Storefront and admin for Brasmora (brasmora.com), a kitchen, cookware and tableware store, built with Next.js 16. Includes product catalog, shopping cart, checkout, order management and analytics.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM 7
- **UI:** HeroUI + Tailwind CSS 4
- **Auth:** JWT-based sessions (HTTP-only cookies)
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod
- **Email:** Resend (optional)
- **i18n:** next-intl
- **Charts:** Recharts
- **Rich Text:** Tiptap

## Features

### Storefront

- Product catalog with category filtering and search
- Product detail pages with image gallery, variants, and reviews
- Shopping cart with validation
- Checkout flow with address management
- Order history and tracking
- User registration and authentication
- Wishlist
- Responsive design with page transitions
- Multi-language support

### Admin Dashboard

- Product management (CRUD, bulk CSV/Excel import)
- Order management with status tracking
- Customer and user management
- Category management
- Banner and CMS page management
- Store settings (branding, tax, shipping, social links)
- Product feed generation (Google Shopping, Facebook)
- Analytics dashboard with KPIs and revenue charts
- Review moderation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
git clone https://github.com/yaroslav-tsarenko/e-commerce-store.git
cd e-commerce-store
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | Prisma Postgres protocol URL | Yes |
| `DIRECT_URL` | Direct PostgreSQL connection URL | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | Yes |
| `RESEND_API_KEY` | Resend API key for emails | No |
| `RESEND_FROM_EMAIL` | Sender email address | No |
| `PAYBYLINK_BASE_URL` | OPPWA host (`https://eu-test.oppwa.com` sandbox, `https://eu-prod.oppwa.com` live) | Yes, for checkout |
| `PAYBYLINK_ENTITY_ID` | OPPWA entity id | Yes, for checkout |
| `PAYBYLINK_AUTH_TOKEN` | OPPWA bearer token | Yes, for checkout |
| `PAYBYLINK_WEBHOOK_SECRET` | 64-character hex decryption key of the OPPWA webhook | Yes, for the payment webhook |

### Database Setup

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

The seed script creates sample categories, a test customer (`test@gmail.com` / `test123!`), and an admin user (`admin@gmail.com` / `admin123!`).

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

## Project Structure

```
src/
├── app/
│   ├── (store)/           # Storefront routes (route group, no URL prefix)
│   │   ├── auth/          # Login, register
│   │   ├── catalog/       # Product catalog
│   │   ├── product/[slug] # Product detail
│   │   ├── cart/          # Shopping cart
│   │   ├── checkout/      # Checkout
│   │   └── account/       # Profile, orders, wishlist, addresses
│   ├── admin/             # Admin dashboard
│   └── api/               # 30+ REST API endpoints
├── components/
│   ├── admin/             # Admin-specific components
│   ├── home/              # Homepage components
│   ├── product/           # Product display
│   ├── catalog/           # Catalog components
│   ├── cart/              # Cart components
│   ├── checkout/          # Checkout components
│   ├── layout/            # Header, footer, navigation
│   └── shared/            # Reusable UI components
├── lib/                   # Utilities, API clients, auth, Prisma client
├── providers/             # React context (Auth, Cart, Theme, Toast)
├── types/                 # TypeScript type definitions
├── validators/            # Zod validation schemas
└── i18n/                  # Locale config, request config, client locale helpers
prisma/
├── schema.prisma          # Database schema (14 models)
└── seed.ts                # Seed data
scripts/                   # Dev server orchestration, data generation
```

## Localization

URLs carry no locale segment. The active locale is kept in `localStorage` (`brasmora.locale`) and mirrored into the `NEXT_LOCALE` cookie, which `src/i18n/request.ts` reads on the server. English is the only locale today. To add one, append its code to `locales` (and a label to `localeLabels`) in `src/i18n/config.ts` and add a `messages/<code>/` folder with one JSON file per namespace listed in `src/i18n/messages.ts` (copy `messages/en/` and translate); the language switcher appears automatically once more than one locale exists.

Brand values live in `src/lib/brand.ts` and legal entity details in `src/lib/company.ts`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Prisma + Next.js) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## API Overview

The API provides endpoints for:

- **Auth** — register, login, logout, session management
- **Products** — CRUD, search, filtering, bulk operations
- **Categories** — hierarchy management
- **Orders** — creation, status updates, history
- **Cart** — add, update, remove, validate
- **Checkout** — process orders with address selection
- **Customers & Users** — management endpoints
- **Reviews** — submission and moderation
- **Wishlist** — add/remove items
- **Settings** — store configuration
- **Feeds** — Google Shopping, Facebook product feeds
- **Import** — CSV/Excel product import with preview
- **Analytics** — KPIs and revenue data
- **Upload** — Image upload
- **Payments** — PayByLink server-to-server notifications

Admin endpoints (product, category, settings, homepage, import, upload, orders, customers, users, analytics and review moderation) require a session whose user role is `ADMIN` or `SUPER_ADMIN`; they answer `401` without a session and `403` for other roles. Contact, newsletter, login, registration and password-reset requests are rate limited per client IP and answer `429` with a `Retry-After` header.

### Payment webhook

Configure the webhook in the OPPWA (PayByLink) back office:

- URL: `https://<your-domain>/api/payments/webhook` (POST, notification type Payments)
- Decryption key: copy it into `PAYBYLINK_WEBHOOK_SECRET`

Notifications are AES-256-GCM encrypted; requests that do not decrypt with the key are rejected with `401`. The notification body is only used to find the order (`merchantTransactionId` is the order number) and the checkout id (`ndc`). The payment status, amount and currency are always re-queried from OPPWA and the order is settled through the same idempotent function as `/api/orders/verify` (the shopper return page), so a notification and a returning shopper can arrive in any order without double fulfilment. When OPPWA cannot be reached the endpoint answers `503` so the notification is retried.

## Deployment

Deploy to Vercel:

```bash
npm i -g vercel
vercel
```

Set the required environment variables in your Vercel project settings before deploying.

## License

MIT
