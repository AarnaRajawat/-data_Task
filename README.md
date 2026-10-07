# DareAI Data Explorer

> **Explore, filter and analyze large-scale support ticket data.**

A production-grade, high-performance, race-condition-safe web application designed to navigate, filter, sort, and inspect a dataset of **25,000+ support tickets** seamlessly.

---

## 🌐 Live Demo & Deployment

- **Frontend (Vercel)**: `https://dareai-data-explorer.vercel.app` *(Configure your Vercel deployment pointing to client)*
- **Backend (Render)**: `https://dareai-server.onrender.com` *(Configure Render web service pointing to server)*

---

## 🚀 Key Features

1. **Race-Condition Safety & Stale-Response Protection**:
   - Queries cancellation using `AbortController` and TanStack Query query keys.
   - Out-of-order network responses (e.g. slow 3000ms query arriving after fast 200ms query) are discarded/aborted so the newest user query always wins.
2. **25,000+ Support Tickets In-Memory Dataset**:
   - Full server-side search across ticket number, customer name, email, subject, description, and agent.
   - Server-side multi-field filtering (`status`, `priority`, `category`).
   - Server-side multi-criteria sorting (`newest`, `oldest`, `recently updated`, `least recently updated`, `priority high → low`, `priority low → high`).
   - Server-side pagination with total records & total pages metadata.
3. **Simulated Real-World Network**:
   - Random latency between **200ms and 3000ms** per request.
   - Random **~10% failure rate** returning HTTP 500 to exercise error handling and retry workflows.
4. **URL-Synchronized Single Source of Truth**:
   - Query parameters (`?q=...&status=...&priority=...&category=...&sort=...&page=...&ticket=...`) drive the entire application state.
   - Full support for browser **Refresh**, **Back**, **Forward**, and **URL sharing**.
5. **Debounced Search**:
   - ~300ms debounce prevents unnecessary API requests while typing.
6. **Virtualized Rendering**:
   - Powered by `@tanstack/react-virtual` to render only the visible DOM nodes + small buffer, maintaining 60 FPS scrolling performance.
7. **URL-Driven Detail Drawer**:
   - Deep-linked ticket drawer (`?ticket=1024`) with isolated loading and error states (partial failure resilience).
   - Keyboard accessible (`Esc` dismisses drawer, focus trapped and returned to triggering row).
8. **First-Class Accessibility (WCAG / WAI-ARIA)**:
   - Accessible status & priority badges with text labels + icons (not color alone).
   - Semantic HTML elements (`<main>`, `<nav>`, `<header>`, `<button>`, `<select>`).
   - Live region (`aria-live="polite"`) for result counts and status announcements.
   - Visible keyboard focus rings.
9. **Honest Loading, Error & Empty States**:
   - Honest skeleton loaders and updating indicators.
   - Real retry mechanism for failed requests.

---

## 🏛️ Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     React 18 + Vite                         │
│                           │                                 │
│                     React Router                            │
│                           │                                 │
│              URL Search Parameters (Source of Truth)        │
│                           │                                 │
│           TanStack Query (with AbortController)             │
│                           │                                 │
│          TanStack Virtual (Virtualized DOM Table)           │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP GET (with query parameters)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                Node.js + Express + TypeScript               │
│                           │                                 │
│             Network Simulator (200-3000ms, 10% 500)         │
│                           │                                 │
│           Ticket Service (Search, Filter, Sort, Page)       │
│                           │                                 │
│            25,000+ Support Tickets In-Memory Dataset        │
└─────────────────────────────────────────────────────────────┘
```

---

## ❓ Architectural Decisions & Rationale

### Why TanStack Query?
TanStack Query manages server state, asynchronous caching, background synchronization, and request cancellation. It decouples UI state from server cache and provides built-in `signal` hooks for cancellation, automatic deduplication, and stale-while-revalidate semantics.

### Race Condition Handling
When a user types rapidly or switches filters, previous in-flight requests may take longer to return (e.g. 2500ms) than newer queries (e.g. 300ms). Without protection, the slow stale response would overwrite the new query.
- **Solution**:
  1. Stable and distinct query keys: `['tickets', { q, status, priority, category, sort, page, limit }]`.
  2. Every request passes `signal` from TanStack Query directly to `fetch(url, { signal })`.
  3. When query parameters change, TanStack Query cancels the prior request's `AbortController` and ignores its response. The newest query is guaranteed to win.

### Why URL as the Single Source of Truth?
Instead of duplicating filter state in Zustand or Redux:
1. Search, filters, sort, page, and selected ticket live directly in URL search params.
2. Enables deep-linking, browser history navigation (Back/Forward), bookmarking, and team sharing.
3. Eliminates state drift between URL and component state.

### Virtualization
Rendering 25,000 rows (or even 50 rows of heavy DOM with badges and tooltips) degrades DOM layout performance and memory. `@tanstack/react-virtual` dynamically calculates container scroll offsets and only renders rows visible in the viewport plus a 5-item overscan buffer.

### Accessibility (a11y)
- All interactive controls use semantic `<button>`, `<select>`, and `<a>` elements.
- Detail drawer uses `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and listens for `Escape`.
- When the drawer opens, focus is directed inside; when closed, focus returns to the triggering table row.
- Color alone is never used to convey status or priority; high-contrast badges include semantic icons and text.
- Live region (`aria-live="polite"`) announces result count updates without interrupting screen readers.

---

## 🧪 Automated Testing Suite

### Unit & Integration Tests (Vitest + React Testing Library)
- **Race Condition Safety** (`client/tests/raceCondition.test.tsx`):
  Simulates a slow Request A (300ms) and fast Request B (50ms); verifies that Request A cannot overwrite Request B.
- **Debounced Search** (`client/tests/searchDebounce.test.tsx`):
  Verifies that rapid keystrokes do not flood the API and only fire after the 300ms debounce interval.
- **Error State & Retry** (`client/tests/errorRetry.test.tsx`):
  Simulates HTTP 500 error, verifies error UI appears with Retry button, and verifies clicking Retry recovers and loads data.
- **URL State Synchronization** (`client/tests/urlState.test.tsx`):
  Verifies that initial URL search parameters correctly restore filters, search term, sorting, and pagination.
- **Detail Drawer Flow** (`client/tests/detailDrawer.test.tsx`):
  Verifies opening a ticket adds `ticket=ID` to URL, loads details, and closing drawer restores list state.
- **Keyboard Navigation** (`client/tests/keyboardAccessibility.test.tsx`):
  Verifies ticket row activation via Enter/Space and drawer dismissal via Escape.
- **Backend API Tests** (`server/src/__tests__/ticketApi.test.ts`):
  Verifies search filtering, multi-parameter filtering, sorting accuracy, boundary pagination, detail retrieval, validation error codes, and health check.

### End-to-End Tests (Playwright)
- **Full Explorer Workflow** (`client/e2e/explorer.spec.ts`):
  Navigates to `/tickets`, searches `"refund"`, filters by `"Open"`, sorts by `"newest"`, opens ticket detail drawer, closes drawer via `Escape`, and verifies URL state and table preservation.

---

## ⚖️ Tradeoffs & Engineering Considerations

1. **In-Memory Store vs Real Database**:
   - For this technical challenge, 25,000 records are generated with a deterministic PRNG and queried in-memory. In a distributed enterprise architecture, queries would be indexed in PostgreSQL or Elasticsearch.
2. **Simulated Network Latency & Failure**:
   - A random 200–3000ms delay and 10% failure rate are intentionally injected to prove asynchronous robustness, cancellation, and failure states. A bypass header (`x-disable-simulation: true`) is provided for automated tests and `/api/health`.
3. **State Management**:
   - Minimalist architecture: React Router for URL state, TanStack Query for server state. No redundant global state store.

---

## 💻 Local Setup & Development

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone & Install
```bash
git clone https://github.com/your-username/dareai-data-explorer.git
cd dareai-data-explorer
```

### 2. Quick Start (Single Command)
```bash
npm install
npm run dev
```
This runs both the backend API server (`http://localhost:5000`) and the Vite client (`http://localhost:5173`) concurrently.

### 3. Or Start Manually in Separate Terminals
```bash
# Terminal 1: Backend Server (http://localhost:5000)
npm --prefix server run dev

# Terminal 2: Frontend Client (http://localhost:5173)
npm --prefix client run dev
```

---

## 🛠️ Verification & Test Commands

```bash
# Run all server tests
npm --prefix server test

# Run all client tests
npm --prefix client test

# Run Playwright E2E tests
npm --prefix client run test:e2e

# Run Production Build
npm run build
```

---

## ⚙️ Environment Variables

### Root / Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000
```

### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
```

---

## 📚 References & Standards

- [React 18 Documentation](https://react.dev)
- [React Router v6](https://reactrouter.com)
- [TanStack Query v5](https://tanstack.com/query/latest)
- [TanStack Virtual v3](https://tanstack.com/virtual/latest)
- [W3C WAI-ARIA Authoring Practices (Dialog & Table Patterns)](https://www.w3.org/WAI/ARIA/apg/)
- [Vitest](https://vitest.dev) & [Testing Library](https://testing-library.com)
- [Playwright](https://playwright.dev)

---

## 🤖 AI Usage Disclosure

In accordance with transparent engineering practices:
- AI code generation tools were utilized to assist in bootstrapping boilerplate, test mocks, and dataset generators.
- All architectural decisions (race-condition cancellation with AbortController, URL-state synchronization, TanStack Virtual integration, accessibility compliance, and test suites) were designed, reviewed, refined, verified, and tested by the engineer.
#   - d a t a _ T a s k  
 #   - d a t a _ T a s k  
 