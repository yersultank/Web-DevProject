# AssetTrack Context (Local Only)

Date: 2026-04-12
Role: Member 2 (Django backend)

## Full Context Message

📦 AssetTrack — Project Plan (1 Week)

━━━━━━━━━━━━━━━━━━━━
📄 PAGES
━━━━━━━━━━━━━━━━━━━━
/login → everyone logs in here
/dashboard → admin sees stats + activity | employee sees their assets
/assets → admin sees all assets + details

━━━━━━━━━━━━━━━━━━━━
👥 WHO DOES WHAT
━━━━━━━━━━━━━━━━━━━━
🅰 Member 1 → Angular (login page, dashboard, JWT interceptor, forms, error handling)
🐍 Member 2 → Django (models, API endpoints, JWT auth, CORS, Postman collection)
⚙️ Member 3 → Integration (routing/layout, assets page, connect frontend↔backend, slides)

━━━━━━━━━━━━━━━━━━━━
📅 DAY BY DAY
━━━━━━━━━━━━━━━━━━━━
Day 1 — Setup (all 3 together)
• Create GitHub repo + add each other as contributors
• ng new frontend + push
• django-admin startproject backend + push
• Write README (names + project description)
• Submit to practice teacher ASAP
• Agree on all API endpoints

Day 2 — Core build
• M1: Login page UI + JWT interceptor + route guard
• M2: JWT login/logout endpoints + Asset CRUD
• M3: Angular routing setup + layout shell (navbar/sidebar)

Day 3 — Features
• M1: Dashboard page (admin stats + employee view using @if)
• M2: Assignment + ConditionReport endpoints, filter by request.user
• M3: Assets list page (@for loop) + asset detail view

Day 4 — Integration
• All 3: replace mock data with real API calls
• M1+M3: dashboard recent activity feed
• M2: fix bugs, make sure CORS works

Day 5 — Forms + checks
• M1: check-out form with 4+ ngModel inputs
• M2: finish Postman collection
• M3: test as admin AND as employee, fix @if role issues

Day 6 — Polish
• Loading states, empty states, error messages
• Fix styling on all 3 pages
• Everyone reads each other's code (prep for Q&A)

Day 7 — Defense prep
• M3: make 4-slide PDF
• Practice 5-min demo: 1. Login as admin → see dashboard stats 2. Go to assets → check out asset to employee 3. Login as employee → see only their asset

━━━━━━━━━━━━━━━━━━━━
🔌 API ENDPOINTS
━━━━━━━━━━━━━━━━━━━━
POST /api/auth/login/ → get JWT token
POST /api/auth/logout/ → invalidate token
GET /api/assets/ → list all assets (admin)
POST /api/assets/ → create new asset (admin)
GET /api/assets/:id/ → one asset detail + history
PUT /api/assets/:id/ → update asset
DELETE /api/assets/:id/ → delete asset
GET /api/dashboard/stats/ → total / assigned / available counts
GET /api/my-assets/ → employee's own assigned assets
POST /api/assignments/ → assign asset to a user (check-out)

━━━━━━━━━━━━━━━━━━━━
🗄 DJANGO MODELS (4)
━━━━━━━━━━━━━━━━━━━━
Asset → name, serial_number, status, category
Category → name
Assignment → asset → user, date, notes (ForeignKey to Asset + User)
ConditionReport → asset, condition (Good/Damaged/Lost), note, date

⚠️ MOST IMPORTANT: M2 must finish auth + asset endpoints by end of Day 2.
If backend isn't ready, M1 and M3 are blocked. Protect Day 2!
