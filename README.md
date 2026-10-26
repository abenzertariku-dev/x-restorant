# Restaurant table & delivery ordering (Next.js 14, App Router)
Local: `npm install && npm run dev` -> http://localhost:3000
Routes: `/`  `/cus/1`  `/ord/wait`  `/admin/mang`  `/rot/dlivery`
Keys live in `.env` (WAITER_KEY=1111, MANAGER_KEY=2222, DRIVER_KEY=3333, SESSION_SECRET). Change them before going live, and set the same names in Render > Environment (those override `.env`). Do not push real keys to a public repo.
Styling: Tailwind CSS 3 (see tailwind.config.js, app/globals.css).
.
