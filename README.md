# 💰 Personal Expense Tracker

A full-stack personal expense tracker with JWT authentication, analytics, budget management, and exportable reports.

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite), Tailwind CSS, React Router v6, Recharts |
| Backend | Python FastAPI, SQLAlchemy ORM, Pydantic v2 |
| Database | SQLite |
| Auth | JWT (python-jose) + bcrypt (passlib) |

---

## 📁 Project Structure

```
expense-tracker/
├── backend/          # FastAPI + SQLAlchemy + SQLite
└── frontend/         # React + Vite + Tailwind CSS
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**

---

### Backend Setup

```bash
# 1. Navigate to backend directory
cd expense-tracker/backend

# 2. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate          # macOS/Linux
# venv\Scripts\activate           # Windows

# 3. Install dependencies
pip install -r requirements.txt

# If behind a corporate SSL proxy (e.g. Sophos), add:
# pip install -r requirements.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org

# 4. Start the backend server
uvicorn main:app --reload --port 8000
```

The API will be available at: **http://localhost:8000**
Interactive Swagger docs: **http://localhost:8000/docs**

---

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd expense-tracker/frontend

# 2. Install dependencies (already done during scaffolding)
npm install

# 3. Start the development server
npm run dev
```

The app will be available at: **http://localhost:5173**

> ⚠️ Make sure the backend is running before starting the frontend.

---

## 🔑 Features

### Authentication
- User registration & login with JWT tokens
- Password hashing with bcrypt
- Protected routes (auto-redirect to login)
- 24-hour token expiry

### Dashboard
- Total expenses (all time)
- Monthly & today's expenses
- Highest spending category
- Recent transactions list
- Category distribution pie chart

### Expense Management
- Add / Edit / Delete expenses
- Fields: Amount, Category, Description, Date, Payment Method
- Search by description
- Filter by category, date range
- Sort by amount or date

### Categories
- Default categories: Food, Travel, Shopping, Bills, Entertainment, Other
- Create, rename, and delete custom categories

### Budget Management
- Set monthly budget
- Visual progress bar (green → yellow → red)
- Warning banner when spending exceeds 80%
- Remaining budget display

### Analytics
- 🥧 Pie chart — category-wise expense distribution
- 📊 Bar chart — monthly expenses (last 6 months)
- 📈 Line chart — daily spending trend

### Reports
- Export to **CSV**
- Export to **Excel** (.xlsx) with styled headers
- Filter by date range before exporting
- Live preview table

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/auth/me` | Get current user profile |
| PUT | `/auth/me` | Update current user name |
| GET | `/expenses` | List expenses (with filters) |
| POST | `/expenses` | Create expense |
| PUT | `/expenses/{id}` | Update expense |
| DELETE | `/expenses/{id}` | Delete expense |
| GET | `/categories` | List categories |
| POST | `/categories` | Create category |
| PUT | `/categories/{id}` | Update category |
| DELETE | `/categories/{id}` | Delete category |
| GET | `/budget` | Get current month budget |
| POST | `/budget` | Set / update budget |
| GET | `/dashboard` | Get dashboard stats |
| GET | `/reports/csv` | Download CSV |
| GET | `/reports/excel` | Download Excel |
| GET | `/reports/preview` | Preview report as JSON |

---

## 🎨 UI Highlights

- **Dark mode** toggle (persisted in localStorage)
- **Glassmorphism** cards with backdrop-blur
- **Responsive** layout with collapsible sidebar on mobile
- **Toast notifications** for all actions
- **Form validation** with Zod + react-hook-form
- **Recharts** for interactive analytics

---

## 🗄️ Database Schema

```
users        (id, name, email, password_hash, created_at)
categories   (id, name, user_id → users.id)
expenses     (id, amount, description, date, payment_method, category_id, user_id, created_at)
budgets      (id, amount, month, year, user_id)
```

SQLite database file: `backend/expenses.db` (auto-created on first run)

---

## 📦 Backend Dependencies (`requirements.txt`)

```
fastapi
uvicorn[standard]
sqlalchemy
python-jose[cryptography]
passlib[bcrypt]
pydantic[email]
python-multipart
pandas
openpyxl
python-dotenv
aiofiles
```

## 📦 Frontend Dependencies (`package.json`)

```
react, react-dom
react-router-dom
axios
recharts
react-hot-toast
react-hook-form, @hookform/resolvers, zod
date-fns
lucide-react
tailwindcss, postcss, autoprefixer
```
