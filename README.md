# AssetOS — Internal Asset Tracker (AssetTrack)

A full-stack web application for tracking, managing, and assigning company assets. Built with Angular (frontend) and Django REST Framework (backend).

---

<<<<<<< HEAD
## 👥 Team Members

| Name | Role |
|------|------|
| Kuralabay Yersultan | Team Lead |
| Abenezer Alemayehu Lemma | Member |
| Yerbolat Yerkebulan | Member |

**Additional contributors / aliases:**

- Yersultan (yersultank)
- abnzrdev
=======
- Yersultan
- Abenezer Alemayehu
>>>>>>> d5f1347 (chore: commit local changes before merging chore/harden-startup-readme-postman into main)

---

## 🚀 Tech Stack

- **Frontend:** Angular 17+, TypeScript, JWT Auth
- **Backend:** Django 4+, Django REST Framework, SimpleJWT
- **Database:** SQLite (development)

---

## ✨ Features

- JWT login & logout with HTTP interceptor
- Full CRUD for assets (create, read, update, delete)
- Role-based data linked to `request.user`
- Asset filtering by category and status
- Profile management
- Animated empty states and loading indicators
- Sentry-inspired dark UI with split-screen login

---

## 📦 How to Start

You can use the included scripts, or run the backend and frontend manually.

### Quick (scripts)

From the project root:

```bash
# Start backend
./scripts/start-backend.sh

# Start frontend
./scripts/start-frontend.sh

# Or run both (separate terminals)
./scripts/start-project.sh
```

### Manual (detailed)

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_assets    # seeds 20 demo assets
python manage.py runserver
```

#### Frontend

```bash
cd frontend
npm install
ng serve
```

Open http://localhost:4200

---

## 📦 Seed Demo Data

Run the provided script to seed demo content:

```bash
./scripts/seed-data.sh
```

Demo accounts (for local/dev only):

- Admin: `admin` / `pass1234`
- Users: `user1`, `user2`, `user3` / `pass1234`

---

## 📬 Postman Collection

A Postman collection is included at:

```
backend/postman/AssetTrack.postman_collection.json
```

Import it into Postman to test all API endpoints.

---

## 📁 Project Structure

```
Web-DevProject/
├── backend/          # Django + DRF
│   ├── assets/       # Main app (models, views, serializers)
│   ├── core/         # Settings, URLs
│   └── postman/      # Postman collection
├── frontend/         # Angular app
│   ├── src/app/
│   │   ├── components/
│   │   ├── services/
│   │   ├── models/
│   │   └── interceptors/
│   └── src/assets/
│       ├── images/   # SVG illustrations
│       └── animations/ # Lottie JSON files
└── scripts/          # Startup scripts
```

---

## 🎓 Course Project — Web Development

This project was created as a course project to demonstrate a full-stack asset tracking application.

