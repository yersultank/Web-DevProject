# AssetOS — Internal Asset Tracker

A full-stack web application for tracking, managing, and assigning company assets. Built with Angular (frontend) and Django REST Framework (backend).

---

## 👥 Team Members

| Name | Role |
|------|------|
| Yersultan K. | Full Stack Developer |
| Member 2 | Full Stack Developer |
| Member 3 | Full Stack Developer |

> ⚠️ Update the names above with your actual team members before defense.

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

## 📦 Setup & Run

### Backend

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

### Frontend

```bash
cd frontend
npm install
ng serve
```

Open [http://localhost:4200](http://localhost:4200)

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
