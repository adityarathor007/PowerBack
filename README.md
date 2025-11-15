project/
│
├── backend/ # FastAPI service
│ ├── main.py
│ ├── models.py
│ ├── schemas.py
│ ├── database.py
│ ├── routers/
│ │ ├── users.py
│ │ └── feeders.py
│ ├── utils/
│ └── requirements.txt
│
└── frontend/ # React (Vite + TailwindCSS)
├── src/
│ ├── pages/
│ ├── components/
│ ├── api/
│ └── context/
├── public/
├── package.json
└── vite.config.js


---

# 🛠️ Local Setup Guide

## 📌 Prerequisites
Make sure you have installed:

- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL 14+**
- **npm**

---

# ⚙️ Backend Setup (FastAPI)

### 1️⃣ Install dependencies
```bash
cd backend
pip install -r requirements.txt
