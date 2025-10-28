# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment Setup

### Prerequisites
Before running the project, you need to set up accounts and obtain API keys:

1. **Stripe** (Payment Processing)
   - Create account at https://dashboard.stripe.com
   - Create a new project/application
   - Copy your Secret Key (starts with `sk_test_` or `sk_live_`)
   - Set up webhook endpoint for your local/production URL
   - Copy your Webhook Secret (starts with `whsec_`)

2. **MongoDB** (Database)
   - Create account at https://www.mongodb.com/cloud/atlas
   - Create a new cluster
   - Copy your connection string (URI)

3. **Vercel Blob** (File Storage)
   - Create account at https://vercel.com
   - Create a Blob storage token
   - Copy your Read/Write token

4. **Payload CMS** (Backend Configuration)
   - Generate a secure random string for `PAYLOAD_SECRET`
   - Can be generated with: `openssl rand -hex 12`

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Then update `.env` with your actual credentials. See `.env.example` for all required variables:

**Important**:
- Never commit `.env` to version control - it contains secrets
- For local development, subdomain routing can be disabled with `NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING=false`

## Project Overview

**Gumroad Clone** is a full-stack marketplace SaaS platform built with Next.js 15, React 19, and TypeScript. It's a multi-tenant system where users can be both buyers (purchasing products) and sellers (creating their own product stores).

**Key Technologies:**
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend:** Payload CMS 3.48.0, tRPC 11.4.3, MongoDB
- **Payments:** Stripe integration
- **Storage:** Vercel Blob for media uploads
- **UI Components:** shadcn/ui + Radix UI primitives

### Running After Setup

Once environment variables are configured:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3008 in your browser
```

## Development Commands

### Essential Commands

```bash
# Start development server (runs on port 3008)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Generate Payload CMS types (after schema changes)
npm run generate:types

# Fresh database migration (destructive - wipes data)
npm run db:fresh

# Seed database with sample data
npm run db:seed

# Generate Payload import map
npm run generate:importmap
```

### Common Development Tasks

**Running the dev server and accessing the app:**
```bash
npm run dev
# Open http://localhost:3008 in browser
# Admin panel at http://localhost:3008/admin
```

**After modifying Payload collections (database schemas):**
```bash
npm run generate:types
# This regenerates src/payload-types.ts with updated types
```

**Resetting database (development only):**
```bash
npm run db:fresh
npm run db:seed  # Optional: add sample data
```

## Architecture Overview

### Directory Structure & Responsibilities

#### `/src/app/` - Next.js App Router
- **Route Structure:** Uses route groups for organization
  - `(app)` - Main application pages
  - `(auth)` - Sign in/sign up pages
  - `(tenants)` - Seller store pages (dynamic subdomains)
  - `(payload)` - CMS admin dashboard
  - `api/trpc` - tRPC server endpoint
  - `api/stripe/webhooks` - Stripe webhook handlers

#### `/src/modules/` - Feature-Based Modules
Core business logic organized by feature. **Each module has a consistent structure:**

```
modules/[feature]/
├── server/
│   └── procedures.ts          # tRPC server endpoints
├── ui/
│   ├── views/                 # Full-page components
│   └── components/            # Reusable components
├── hooks/                      # Custom React hooks
├── store/                      # Zustand stores (if needed)
├── schemas.ts                  # Zod validation schemas
├── types.ts                    # TypeScript types
├── constants.ts               # Feature-specific constants
└── search-params.ts           # URL parameter handling
```

**Key modules:**
- `auth/` - Authentication, sign-in/up
- `products/` - Product listing, filtering, sorting
- `checkout/` - Shopping cart & payment flow
- `library/` - User's purchased products
- `categories/` - Category browsing
- `tenants/` - Seller store management
- `reviews/` - Product reviews and ratings
- `home/` - Homepage navigation components

#### `/src/collections/` - Payload CMS Database Schemas
Define database models using Payload CMS collection definitions:
- `Users.ts` - User accounts with auth & roles
- `Tenants.ts` - Seller stores (multi-tenant support)
- `Products.ts` - Products with multi-tenant ownership
- `Categories.ts` - Product categories
- `Tags.ts` - Product classification tags
- `Orders.ts` - Purchase orders
- `Reviews.ts` - Product reviews
- `Media.ts` - File uploads

**Important:** After modifying collections, run `npm run generate:types` to update TypeScript types.

#### `/src/components/` - Shared UI Components
- `/ui/` - Radix UI wrapped components (30+ primitive components)
- Shared components like `star-rating.tsx`, `stripe-verify.tsx`

#### `/src/trpc/` - Type-Safe API Layer
- `init.ts` - tRPC initialization with context and base procedures
- `routers/_app.ts` - Root router combining all feature routers
- `server.ts` - Server-side tRPC client
- `client.tsx` - Client-side tRPC client with React Query integration
- `query-client.ts` - React Query configuration

#### `/src/lib/` - Utilities
- `access.ts` - Authorization/role checking functions
- `stripe.ts` - Stripe utility functions
- `utils.ts` - General utility functions
- `constants.ts` - App-wide constants

#### `/src/middleware.ts` - Multi-Tenant Routing
Handles subdomain-based tenant routing. Ensures each seller's store is accessible at `{tenant-slug}.localhost:3008` and routes requests accordingly.

## API Design Pattern (tRPC)

### How tRPC Procedures Work

1. **Define Server Procedures** in `modules/[feature]/server/procedures.ts`:
```typescript
export const featureRouter = router({
  getItems: publicProcedure
    .input(GetItemsSchema)  // Zod schema for validation
    .query(async ({ ctx, input }) => {
      // ctx has Payload CMS instance for DB access
      const items = await ctx.payload.find({
        collection: 'items',
        where: { /* filters */ }
      });
      return items;
    }),

  createItem: protectedProcedure  // Auth required
    .input(CreateItemSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.payload.create({
        collection: 'items',
        data: input
      });
    })
});
```

2. **Combine Routers** in `src/trpc/routers/_app.ts`:
```typescript
export const appRouter = router({
  feature: featureRouter,
  // ... other feature routers
});
```

3. **Use Client-Side** in React components:
```typescript
const { data } = trpc.feature.getItems.useQuery({ /* input */ });
const { mutate } = trpc.feature.createItem.useMutation();
```

**Key Procedures:**
- `publicProcedure` - No authentication required
- `protectedProcedure` - User must be authenticated
- Input validation with Zod ensures type safety at runtime

## State Management

### Server State (Data from Backend)
- **Tool:** React Query + tRPC
- **Usage:** Fetching data from Payload CMS
- **Location:** Handled automatically through tRPC hooks in components

### Client State (UI State)
- **Tool:** Zustand stores
- **Location:** `modules/[feature]/store/`
- **Example:** `modules/checkout/store/use-cart-store.ts` manages shopping cart

### URL State (Filters, Pagination)
- **Tool:** `nuqs` library
- **Usage:** Sync URL search parameters with React state
- **Example:** `modules/products/search-params.ts` handles filter state in URL

### Authentication State
- **Tool:** Payload CMS built-in session management
- **Access:** Via `ctx.user` in tRPC procedures

## Multi-Tenancy Architecture

### How Multi-Tenancy Works

1. **Tenant Storage:** Each seller creates a "Tenant" (store) with:
   - Name, slug (unique identifier)
   - Custom subdomain support
   - Stripe account ID for payments

2. **Subdomain Routing:** `middleware.ts` routes requests:
   - `app.localhost:3008` → Main marketplace (buyer view)
   - `seller-name.localhost:3008` → Specific seller's store

3. **Product Isolation:** Products have a `tenant` field linking to seller

4. **Payload Plugin:** Uses `@payloadcms/plugin-multi-tenant` for built-in tenant isolation

### Accessing Tenant Context
Most procedures should filter by tenant:
```typescript
// Get products for a specific tenant
const products = await ctx.payload.find({
  collection: 'products',
  where: { tenant: { equals: tenantId } }
});
```

## Database & Payload CMS

### Key Concepts

- **Collections:** Database tables defined in `/src/collections/`
- **Admin UI:** Automatic admin panel at `/admin` for CRUD operations
- **Type Safety:** `npm run generate:types` creates `payload-types.ts` with full TypeScript support
- **Database:** MongoDB configured in `payload.config.ts`
- **Storage:** Vercel Blob for file uploads

### Common Payload Queries

```typescript
// Find documents
const docs = await ctx.payload.find({
  collection: 'products',
  where: { category: { equals: 'electronics' } },
  limit: 10
});

// Create document
const doc = await ctx.payload.create({
  collection: 'products',
  data: { name: 'Product', price: 99 }
});

// Update document
const doc = await ctx.payload.update({
  collection: 'products',
  id: 'doc-id',
  data: { name: 'Updated Name' }
});

// Delete document
await ctx.payload.delete({
  collection: 'products',
  id: 'doc-id'
});
```

## Stripe Integration

### Payment Flow

1. **Checkout:** User proceeds through checkout view
2. **Stripe Session:** tRPC mutation creates Stripe checkout session
3. **Redirect:** User redirected to Stripe Checkout page
4. **Webhook:** Stripe sends webhook event after successful payment
5. **Order Creation:** Webhook handler creates order record

### Key Files
- `modules/checkout/server/procedures.ts` - Checkout procedures
- `src/app/(app)/api/stripe/webhooks/route.ts` - Webhook handling
- `src/lib/stripe.ts` - Stripe utility functions
- `collections/Orders.ts` - Order schema

## UI Component System

### Component Hierarchy

1. **Radix UI Primitives** (`src/components/ui/`) - Unstyled, accessible components:
   - Dialog, Button, Input, Select, Dropdown Menu, Accordion, etc.
   - Used as building blocks

2. **shadcn/ui Components** - Pre-styled versions built on Radix UI

3. **Feature Components** (`modules/[feature]/ui/components/`) - Business logic components
   - Product cards, filters, checkout items, etc.

4. **View Components** (`modules/[feature]/ui/views/`) - Full page layouts
   - Product listing page, checkout page, library page, etc.

### Styling

- **Tailwind CSS 4** - Utility classes for styling
- **Custom Components:** Use `clsx` and `tailwind-merge` for dynamic classes:
```typescript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const className = twMerge(
  clsx('px-4 py-2', isActive && 'bg-blue-500')
);
```

## Key Patterns & Best Practices

### 1. Module Organization
Keep related code together. Each feature module should be self-contained with its own procedures, UI, hooks, and schemas.

### 2. Type Safety
- Use Zod schemas for both validation and TypeScript type inference
- Leverage Payload's auto-generated types
- Enable TypeScript strict mode (configured in `tsconfig.json`)

### 3. Server vs. Client
- **Server procedures** (`modules/*/server/procedures.ts`) - Data access, auth
- **Client hooks** (`modules/*/hooks/`) - UI state management
- Clear separation of concerns

### 4. Error Handling
- tRPC procedures should throw `TRPCError` for specific error codes
- Use `sonner` for toast notifications
- Components should have error boundaries for graceful degradation

### 5. Data Fetching
- Use tRPC hooks for queries and mutations
- React Query handles caching automatically
- For URL state (filters, pagination), use `nuqs` for synchronization

### 6. Form Handling
- Use `react-hook-form` with Zod schemas
- Resolvers enable type-safe form validation
- Keep form schemas in `modules/[feature]/schemas.ts`

## Common Development Workflows

### Adding a New Feature Module

1. Create folder structure:
```bash
mkdir -p src/modules/feature-name/{server,ui/views,ui/components,hooks,store}
```

2. Create files:
- `src/modules/feature-name/schemas.ts` - Zod validation
- `src/modules/feature-name/types.ts` - TypeScript types
- `src/modules/feature-name/server/procedures.ts` - tRPC endpoints
- `src/modules/feature-name/ui/views/` - Page components
- `src/modules/feature-name/ui/components/` - Reusable components

3. Add router to `src/trpc/routers/_app.ts`

4. Export types for client-side use

### Adding a Database Collection

1. Create `src/collections/NewCollection.ts` following Payload CMS collection pattern
2. Import in `payload.config.ts`
3. Run `npm run generate:types` to generate TypeScript types
4. Reference types as `Extract<Payload['collections'], { slug: 'new-collection' }>`

### Adding a UI Component

1. If primitive/shared: `src/components/[name].tsx`
2. If feature-specific: `src/modules/feature/ui/components/[name].tsx`
3. Use Tailwind for styling
4. Ensure accessibility (ARIA labels, keyboard navigation)

### Handling Authentication

1. Check `ctx.user` in tRPC procedures - it's populated by Payload
2. Use `protectedProcedure` for authenticated-only endpoints
3. Redirect unauthenticated users at component level with middleware/redirects

## Testing Notes

**No test framework currently configured.** Consider adding Jest or Vitest when expanding test coverage. Focus areas would be:
- tRPC procedure logic
- Stripe integration
- Multi-tenancy isolation
- Authorization checks

## Performance Considerations

### Optimization Strategies

1. **Code Splitting:** Next.js automatically code-splits route groups
2. **Image Optimization:** Use Next.js `<Image>` component for product images
3. **React Query Caching:** Automatic caching prevents redundant API calls
4. **URL Search Params:** Use `nuqs` for efficient state synchronization
5. **Payload Filtering:** Filter at database layer, not in JavaScript

### Areas to Monitor

- Product list pagination (large catalogs)
- Stripe integration latency
- Image upload processing (Vercel Blob integration)
- Concurrent user sessions on seller stores

## Troubleshooting

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm package-lock.json
npm install

# Rebuild
npm run build
```

### Type Errors After Collection Changes
```bash
npm run generate:types
```

### Middleware Not Routing Correctly
Check `src/middleware.ts` and verify tenant slugs match subdomain format.

### Stripe Webhook Not Triggering
Ensure webhook endpoint in `src/app/(app)/api/stripe/webhooks/route.ts` is publicly accessible and Stripe account is configured with correct webhook URL.

## Repository Links

- **Main Branch:** `main` (production-ready code)
- **Git History:** Recent commits focused on stability and cleanup

## Libraries & Dependencies

### Core Framework & Runtime
- `Next.js` (15.4.2) - React framework with server-side rendering and API routes
- `React` (19.1.0) - UI library for building component-based interfaces
- `React DOM` (19.1.0) - React rendering library for web browsers
- `TypeScript` (^5) - Typed superset of JavaScript for type-safe development

### Backend & Database
- `Payload CMS` (^3.48.0) - Headless CMS with built-in admin UI
- `@payloadcms/db-mongodb` (^3.48.0) - MongoDB adapter for Payload
- `@payloadcms/next` (^3.48.0) - Next.js integration for Payload
- `@payloadcms/plugin-multi-tenant` (^3.48.0) - Multi-tenancy support for Payload
- `@payloadcms/richtext-lexical` (^3.48.0) - Rich text editor powered by Lexical
- `@payloadcms/storage-vercel-blob` (^3.48.0) - Vercel Blob storage adapter for Payload
- `@payloadcms/payload-cloud` (^3.48.0) - Payload Cloud integration

### API & Data Fetching
- `tRPC` (^11.4.3) - Type-safe API layer
  - `@trpc/server` - Server-side procedures
  - `@trpc/client` - Client-side hooks
  - `@trpc/tanstack-react-query` - React Query integration
- `@tanstack/react-query` (^5.83.0) - Server state management and caching
- `superjson` (^2.2.2) - JSON serialization for complex types

### UI Components & Styling
- `Radix UI` (^1.x) - Unstyled, accessible component primitives
  - Includes: Accordion, Alert Dialog, Avatar, Checkbox, Dialog, Dropdown Menu, Label, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Slider, Switch, Tooltip, and more
- `Tailwind CSS` (^4) - Utility-first CSS framework
- `@tailwindcss/postcss` (^4) - PostCSS plugin for Tailwind
- `Lucide React` (^0.525.0) - Icon library with React components
- `Embla Carousel` (^8.6.0) - Carousel/slider component
- `class-variance-authority` (^0.7.1) - CSS class composition utilities
- `clsx` (^2.1.1) - Conditional className combining
- `tailwind-merge` (^3.3.1) - Merge Tailwind CSS classes without conflicts

### Forms & Validation
- `React Hook Form` (^7.60.0) - Performant form library with hooks
- `@hookform/resolvers` (^5.1.1) - Validation resolvers for React Hook Form
- `Zod` (^4.0.5) - TypeScript-first schema validation

### State Management
- `Zustand` (^5.0.6) - Lightweight state management library
- `nuqs` (^2.4.3) - URL search parameters state sync

### Utilities & Integrations
- `Stripe` (^18.3.0) - Payment processing SDK
- `next-themes` (^0.4.6) - Theme switching (light/dark mode)
- `sonner` (^2.0.6) - Toast notification library
- `GraphQL` (^16.11.0) - Query language for APIs
- `client-only` (^0.0.1) - Marker for client-only code
- `server-only` (^0.0.1) - Marker for server-only code

### Development Tools
- `ESLint` (^9) - Code linting
- `eslint-config-next` (15.4.2) - Next.js ESLint configuration
- `@types packages` - TypeScript type definitions for Node.js, React, and React DOM
- `tw-animate-css` (^1.3.5) - Tailwind CSS animation utilities
