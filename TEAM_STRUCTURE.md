# Team Structure and Module Breakdown

This document lists the 7 team members, our roles, and the specific files each member developed for the restaurant management system.

---

## Team Overview

| # | Name | Role | Main Folders & Files |
|---|------|------|----------------------|
| 1 | Vishal | Customer Application | `components/screens/`, `types/customer.ts`, `data/menuItems.ts` |
| 2 | Vennela | Kitchen Display System (KDS) | `components/kitchen/`, `types/kitchen.ts`, `app/kitchen/page.tsx` |
| 3 | Nayana Shivakumar | Waiter Floor Console | `components/waiter/`, `types/waiter.ts`, `app/waiter/page.tsx` |
| 4 | Suhas Bharath | UI/UX & Design System | `tailwind.config.js`, `app/globals.css`, `components/ui/` |
| 5 | Prajwal | Manager POS & Reporting | `components/manager/`, `types/manager.ts`, `app/manager/page.tsx` |
| 6 | Manjunath | Build, QA & Deployment | Project configs, build validation, Surge deployment |
| 7 | Suhas M | Technical & State Architecture | `store/useSharedBridge.ts`, `context/CustomerContext.tsx` |

---

## Member Work Details

### 1. Vishal - Customer Application
- Developed the 10 customer-facing screens.
- Created table QR onboarding flow and menu catalog display.
- Implemented the quantity button controls (`[-]` and `[+]`).
- Built the cart page with duplicate item separation (new items vs items already firing in the kitchen).
- Developed the live tracking screen with 4 preparation stages and the final itemized bill.

### 2. Vennela - Kitchen Display System (KDS)
- Created the kitchen login screen with PIN entry for station cooks.
- Implemented station routing for Dum Biryani, Kebabs, Desserts, and Master Dispatch.
- Developed the bulk order summary card to group identical orders from multiple tables.
- Added preparation stage buttons (`1.REC`, `2.PREP`, `3.READY`, `4.SERVED`) directly on bulk items to update other screens in real time.
- Implemented individual table ticket bump buttons and timers.

### 3. Nayana Shivakumar - Waiter Floor Console
- Designed the table overview grid showing table statuses and guest counts.
- Added support for merged tables with combined table labels.
- Implemented the Screen 3 right-side panel layout so waiters can take orders, customize dishes, merge tables, and settle payments without navigating away from the table view.
- Added the safety check on table vacating so the table can only be cleared after payment is confirmed.

### 4. Suhas Bharath - UI/UX & Design System
- Selected the restaurant theme colors (warm orange `#FF5E00`, deep wood `#2B1408`, and dark background `#120A05`).
- Styled responsive layouts for mobile phones, tablets, and desktop displays.
- Designed status tags and badges for tables, kitchen items, and order stages.
- Handled animations and micro-interactions for buttons and modals.

### 5. Prajwal - Manager POS & Reporting
- Developed the 16 management screens.
- Implemented daily sales totals, revenue numbers, and average table times.
- Built the menu 86 inventory stock toggle to turn items on or off instantly across all screens.
- Created staff attendance, waiter cash settlement, and daily close report views.

### 6. Manjunath - Build, QA & Deployment
- Set up TypeScript configuration and resolved compiler type errors.
- Handled production builds with Next.js static export.
- Deployed the application to Surge CDN for public web access.
- Tested responsive views across mobile and tablet screen sizes.

### 7. Suhas M - Technical & State Architecture
- Designed the central Zustand store (`useSharedBridge.ts`) that links all screens.
- Connected customer order submissions to generate kitchen tickets and waiter alerts.
- Synchronized kitchen bump updates with customer tracking progress.
- Wired payment completion to unlock waiter table vacating.
