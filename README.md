# ⚡ PowerBack – Electricity Outage Tracking System
PowerBack is a full-stack web application that helps users track electricity outages in their area in real time.
It consists of:

- **React (Vite) Frontend**
- **FastAPI Backend (Python)**
- **PostgreSQL Database**
- Role-based dashboards for **Admin**, **Staff**, and **Users**
- JWT-based authentication
- Feeder management + status updates
- Staff assignment workflows

---

#  Local Setup Guide

##  Prerequisites
Make sure you have installed:

- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL 14+**
- **npm**

---

# ⚙️ Backend Setup (FastAPI)

### 1️⃣ Install dependencies
```bash
cd powerback-backend
pip install -r requirements.txt
```

### 2️⃣ Create PostgreSQL database
Open psql:

```bash
CREATE DATABASE powerback;
```

Update your .env file:
```bash
DATABASE_URL=postgresql://username:password@localhost/powerback
JWT_SECRET=your_secret_key
```

3️⃣ Run FastAPI server
```bash
uvicorn main:app --reload
```

Backend will run at:
```bash
http://localhost:8000
```

# Frontend Setup (React + Vite)
```bash
cd powerback-frontend
npm install
```

2️⃣ Create .env file
```bash
VITE_API_URL=http://localhost:800
```

3️⃣ Start React dev server
```bash
npm run dev
```
Frontend will run at:
```bash
http://localhost:5173
```


🔐 User Roles
Admin
* Manages feeders
* Asigns staff
* Adds feeders

Staff
* Updates feeder status
* Sets expected restore
* Writes remarks
* Only sees assigned feeders

User
* Views the assigned feeder
* Tracks real-time outage information
