# Daily Workflow & Important Tasks Checklist

This guide outlines your daily checklist, shortcuts, and commands across your **3 primary roles**.

---

## ⚡ Quick 1-Click Tasks in VS Code
You can trigger these directly from VS Code by pressing **`Ctrl + Shift + P` ➔ type `Run Task`**:
- **`🚀 1. Start Dev Server (Local App)`** — Runs `npm run dev` and serves the app at `http://localhost:3000`.
- **`🔍 2. Check TypeScript & Code Errors`** — Runs `npx tsc --noEmit` to verify 0 code errors.
- **`📦 3. Run Production Build`** — Runs `npm run build` to verify the static export.

---

## 📋 Daily 3-Role Checklist

### 🛡️ Role 1: Repository Owner & Team Admin
- [ ] **Check Team Branches:** Click the **Git Graph** button on the bottom blue status bar to visually inspect all 7 member branches.
- [ ] **Check Pull Requests:** Click the **GitHub icon** on the left activity bar to see any new branch reviews.
- [ ] **Pending Invites:** Check if teammates have accepted at:
  `https://github.com/suhassuhas4120/thoogudeepa-restaurant-system/settings/access`

### ⚙️ Role 2: Technical & State Architecture
- [ ] **Check Code Correctness:** Look at **Error Lens** in any open file — ensure there are no red inline warning banners.
- [ ] **Check Code Formatting:** Whenever you edit a file, press `Ctrl + S` (Prettier automatically formats your code).
- [ ] **Inspect Shared State:** Check `store/useSharedBridge.ts` if modifying cross-portal logic (orders, kitchen bumps, payments, vacating).

### 🚀 Role 3: Integration & Release Reviewer
- [ ] **Run Local Server:** Run `npm run dev` and test:
  - Customer Portal: `http://localhost:3000/`
  - Kitchen KDS: `http://localhost:3000/kitchen`
  - Waiter Console: `http://localhost:3000/waiter`
  - Manager Suite: `http://localhost:3000/manager`
- [ ] **Test Responsive Views:** Press `F12 ➔ Ctrl + Shift + M` in Chrome to test on mobile (390px) and tablet (1024px).
- [ ] **Verify Cloud Deployment:** Open `https://thoogudeepa-mane.surge.sh/` to ensure live app is running smoothly.

---

## 🧭 Important Left-Sidebar Tools
- 🌳 **Tree Icon (Todo Tree):** Click on the tree icon on the left bar to see all `TODO` and `NOTE` items across the codebase.
- 🌿 **Source Control Icon:** Review local uncommitted changes before pushing.
- 🌐 **Rest Client:** Easily test any API requests from within VS Code.
