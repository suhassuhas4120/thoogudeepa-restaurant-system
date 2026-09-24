# Thoogudeepa Donne Biryani Mane - Restaurant Management Web App

A full-stack responsive web application designed for restaurant dining operations. The system connects customers, kitchen staff, floor waiters, and management on a shared real-time dashboard.

Live Website: https://thoogudeepa-mane.surge.sh/

---

## About The Project

This application was created to manage restaurant table dining from start to finish. When customers sit at a table, they can scan a QR code to view the menu, select items, and track their preparation status. The kitchen receives orders categorized by station and can update cooking stages. Waiters manage tables from a tablet interface, taking orders, handling bills, and clearing tables once payment is settled. Management can view live daily sales, floor occupancy, and inventory.

---

## Core Portals

### 1. Customer Ordering Portal (`/`)
- Mobile web layout accessible directly from table QR codes.
- Food menu organized into categories: Bestsellers, Biryani, Starters, Beverages, and Desserts.
- Item quantity buttons with clean `[-]` and `[+]` controls.
- Cart with duplicate order prevention (separates newly added dishes from items already sent to the kitchen).
- 4-stage order tracker showing progress: Order Received, Cooking, Quality Checked, and Served.
- Itemized bill view with GST breakdown.

### 2. Kitchen Display System (KDS) (`/kitchen`)
- PIN login for kitchen stations (Dum Biryani, Kebab & Tandoor, Desserts, and Master Dispatch).
- Bulk order view that groups matching items across different tables together.
- One-click preparation buttons on bulk items (`1.REC`, `2.PREP`, `3.READY`, `4.SERVED`) that automatically update both customer and waiter screens.
- Individual table order cards with timers and status bump buttons.

### 3. Waiter Tablet Console (`/waiter`)
- Visual table grid showing table numbers, guest count, and current status (Vacant, Seated, Cooking, Ready, Paid).
- Support for merging tables for larger dining groups.
- Right-side action panel on Screen 3:
  - Take Order: Menu list with quick add and quantity buttons.
  - Item Customization: Spice levels and portions.
  - Merge Tables: Select and combine adjacent tables.
  - Payment: Cash, UPI, and Card options.
  - Print Bill: Clean receipt format.
- Table vacate lock: The vacate button stays disabled until payment is verified.

### 4. Manager Dashboard (`/manager`)
- Live sales total, order counts, and occupied table count.
- Floor plan overview.
- Menu 86 toggle: mark sold-out items out of stock instantly.
- Staff attendance and kitchen speed tracking.
- Daily report summary.

---

## Team Members and Responsibilities

Our team of 7 members worked on different areas of the application:

1. **Vishal** - Customer App
   - Customer onboarding, menu catalog, item detail drawer, cart screen, order tracking, and final bill view.
   - Files: `components/screens/`, `types/customer.ts`, `data/menuItems.ts`

2. **Vennela** - Kitchen Display System
   - Kitchen PIN login, station dispatch routing, bulk order grouping, prep stage buttons, and kitchen ticket handling.
   - Files: `components/kitchen/`, `types/kitchen.ts`, `app/kitchen/page.tsx`

3. **Nayana Shivakumar** - Waiter Floor Console
   - Floor table grid, table merge badges, Screen 3 right-side command panel, order entry, and payment-locked table vacating.
   - Files: `components/waiter/`, `types/waiter.ts`, `app/waiter/page.tsx`

4. **Suhas Bharath** - UI/UX & Design System
   - Color scheme (warm heritage restaurant theme), responsive styling, badges, and layout templates.
   - Files: `tailwind.config.js`, `app/globals.css`, `components/ui/`

5. **Prajwal** - Manager Dashboard & POS
   - Sales summary screens, table turnover rates, 86 item inventory controls, staff schedule, and report views.
   - Files: `components/manager/`, `types/manager.ts`, `app/manager/page.tsx`

6. **Manjunath** - Build & Deployment
   - TypeScript setup, static production builds, Surge hosting deployment, and device testing.
   - Files: `tsconfig.json`, `next.config.ts`, `package.json`

7. **Suhas M** - Technical & State Architecture
   - Shared Zustand state store connecting customer orders, kitchen tickets, waiter tables, and manager data.
   - Files: `store/useSharedBridge.ts`, `context/CustomerContext.tsx`

---

## Project Structure

```
thoogudeepa-restaurant-system/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── kitchen/page.tsx
│   ├── waiter/page.tsx
│   └── manager/page.tsx
├── components/
│   ├── screens/
│   ├── kitchen/
│   ├── waiter/
│   ├── manager/
│   └── ui/
├── context/
│   └── CustomerContext.tsx
├── data/
│   └── menuItems.ts
├── hooks/
│   ├── useKitchenQuery.ts
│   ├── useMenuQuery.ts
│   ├── useOrderTrackingQuery.ts
│   └── useWaiterQuery.ts
├── store/
│   ├── useSharedBridge.ts
│   ├── useCustomerStore.ts
│   ├── useKitchenStore.ts
│   ├── useWaiterStore.ts
│   └── useManagerStore.ts
├── types/
│   ├── customer.ts
│   ├── kitchen.ts
│   ├── waiter.ts
│   └── manager.ts
├── TEAM_STRUCTURE.md
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```
This generates the static export in the `out/` folder.

---

## Tech Stack
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- Lucide React
- Framer Motion
