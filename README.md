# 🏡 Airbnb Clone

A full-stack Airbnb Clone built using **Next.js**, **FastAPI**, **TypeScript**, and **SQLite**. The application allows users to browse properties, book stays, manage listings as hosts, and leave reviews.

---

## 🚀 Live Demo

### Frontend
https://airbnb-clone-mhfqkgl2k-dapinder-kaur-projects.vercel.app

### Backend API
https://airbnb-clone-7vgt.onrender.com/docs

### GitHub Repository
https://github.com/dapinderbhullar/airbnb-clone
---

## ✨ Features

- 🔐 JWT Authentication
- 👤 Guest & Host Roles
- 🏡 Browse Property Listings
- ➕ Add New Property
- ✏️ Edit & Delete Properties
- 📅 Book Properties
- 📋 View My Bookings
- ⭐ Leave Reviews & Ratings
- 🔍 Search Properties
- 📱 Responsive Design
- 🌐 Deployed on Vercel & Render

---

## 🛠️ Tech Stack

### Frontend

- Next.js
- TypeScript
- React
- Tailwind CSS

### Backend

- FastAPI
- SQLAlchemy
- SQLite
- JWT Authentication
- Pydantic

### Deployment

- Vercel (Frontend)
- Render (Backend)

---

# 📸 Screenshots

## 🏠 Home Page

![Home](screenshots/home.png)

---

## 🏡 Property Details

![Property Details](screenshots/details.png)

---

## 🔐 Login

![Login](screenshots/login.png)

---

## 👨‍💼 Host Dashboard

![Host Dashboard](screenshots/host.png)

---

## 📅 My Bookings

![Bookings](screenshots/booking.png)

---

## ⭐ Reviews

![Reviews](screenshots/reviews.png)

---

# 📂 Project Structure

```text
airbnb-clone/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── screenshots/
│   ├── home.png
│   ├── details.png
│   ├── login.png
│   ├── host.png
│   ├── booking.png
│   └── reviews.png
│
├── .gitignore
└── README.md
```

---

# ⚙️ Installation

## Clone the Repository

```bash
git clone https://github.com/dapinderbhullar/airbnb-clone.git
cd airbnb-clone
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

python -m uvicorn main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

Swagger Documentation:

```
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

## Environment Variables

### Backend (.env)

```env
SECRET_KEY=your-secret-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

# 📖 API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /auth/signup | Register User |
| POST | /auth/login | Login |
| GET | /listings | Get Listings |
| POST | /listings | Create Listing |
| PUT | /listings/{id} | Update Listing |
| DELETE | /listings/{id} | Delete Listing |
| POST | /bookings | Create Booking |
| GET | /bookings | View Bookings |
| POST | /reviews | Add Review |

---

# 👨‍💻 Author

**Dapinder Bhullar**

GitHub: https://github.com/dapinderbhullar

---

# ⭐ Future Improvements

- ❤️ Wishlist persistence
- 🗺️ Google Maps integration
- ☁️ Cloudinary image uploads
- 💳 Stripe payment gateway
- 🐘 PostgreSQL database
- 📧 Email notifications

---

## 📄 License

This project was developed for educational purposes.