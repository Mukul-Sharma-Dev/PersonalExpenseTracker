# 💰 Personal Expense Tracker

A full-stack personal finance management platform that leverages a modern React frontend and a FastAPI Python backend to optimize your budget, track daily expenses, and provide real-time financial analytics.

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Database Schema](#database-schema)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Production Roadmap](#production-roadmap)
- [License](#license)

---

## Overview

The Personal Expense Tracker is an intelligent financial tool designed to modernize how you manage money. The system uses a secure backend and a highly interactive frontend to analyze your spending habits, manage category-wise budgets, and generate detailed reports.

### Key Objectives

- **Adaptive Budgeting**: Dynamically track and warn users when they approach their monthly spending limits.
- **Visual Analytics**: Automated breakdown of expenses with interactive charts and graphs.
- **Smart Notifications**: Real-time alerts for system events, budget warnings, and report generation.
- **Data Export**: Seamless generation of Excel and CSV reports for personal record-keeping.

---

## System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      Personal Expense Tracker                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────────────┐ │
│  │   Frontend   │────▶│   Backend    │────▶│     Database (SQLite /   │ │
│  │  (React/Vite)│◀────│  (FastAPI)   │◀────│       PostgreSQL)        │ │
│  └──────────────┘     └──────────────┘     └──────────────────────────┘ │
│         │                    │                                          │
│         │                    │                                          │
│         │          ┌─────────▼─────────┐                                │
│         └─────────▶│    Cloudinary     │                                │
│                    │  (Image Hosting)  │                                │
│                    └───────────────────┘                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend
| Component | Technology |
|-----------|------------|
| API Framework | FastAPI |
| Database ORM | SQLAlchemy |
| Database | SQLite (Local) / PostgreSQL (Production) |
| Authentication | Passlib with bcrypt (JWT Tokens) |
| Data Processing | Pandas, Openpyxl |

### Frontend
| Component | Technology |
|-----------|------------|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Routing | React Router DOM 6 |
| Charts | Recharts |
| Animations| Framer Motion |
| Styling | Tailwind CSS, PostCSS |

---

## Project Structure

```text
expense-tracker/
├── backend/                      # FastAPI backend application
│   ├── app/
│   │   ├── database/             # Database connection configuration
│   │   ├── models/               # SQLAlchemy database models
│   │   ├── routers/              # API endpoints
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   └── utils/                # JWT auth and hashing helpers
│   ├── main.py                   # Application entry point
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Environment configuration
│
└── frontend/                     # React frontend application
    ├── src/
    │   ├── App.jsx               # Main application component
    │   ├── main.jsx              # Application entry point
    │   ├── components/           # Reusable UI components (Navbar, Modals)
    │   ├── context/              # React context providers (AuthContext)
    │   ├── pages/                # Application pages (Dashboard, Analytics, etc.)
    │   ├── routes/               # Routing configuration
    │   └── services/             # API service functions (Axios)
    ├── package.json              # Node.js dependencies
    ├── vite.config.js            # Vite configuration
    └── tailwind.config.js        # Tailwind CSS configuration
```

---

## Features

### Public Interface
- **Landing Page**: Animated hero section with modern glassmorphism UI, feature showcase, and a contact form.

### Authentication & Profile
- **Combined Auth Page**: Cinematic sliding panel for Sign In / Sign Up, fully responsive for mobile.
- **Secure Avatar Uploads**: Backend-processed integration with Cloudinary for secure profile picture management.
- **Profile Management**: Update display name and profile settings on the fly.

### Dashboard & Analytics
- **Dashboard Overview**: Real-time financial statistics, highest spending category, and recent transactions.
- **Analytics View**: Interactive Pie charts (category distribution), Bar charts (monthly comparison), and Line charts (daily trends).
- **Smart Notifications**: Dropdown alerts for budget thresholds (50%, 80%, 100%), new expenses, and report generation.

### Expense & Budget Management
- **Expense Control**: Full CRUD operations for expenses with advanced filtering (by date, category, search term) and sorting.
- **Custom Categories**: Manage custom categories with unique icons and colors.
- **Budget Tracking**: Visual progress bars mapping your spending against your monthly budget limits.

### Reports
- **Export Capabilities**: Generate styled `.xlsx` (Excel) and `.csv` files for selected date ranges.

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | User authentication, avatar URLs, and profile data |
| `categories` | User-specific expense categories with colors and icons |
| `expenses` | Core transactional data linked to categories and users |
| `budgets` | Monthly spending limits defined by the user |
| `contacts` | Messages submitted from the public landing page |

---

## Installation

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Mac/Linux (For Windows: venv\Scripts\activate)

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

**.env Configuration (`backend/.env`):**
```env
DATABASE_URL=sqlite:///./expenses.db
SECRET_KEY=your_super_secret_jwt_key
ACCESS_TOKEN_EXPIRE_MINUTES=10080

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

---

## Running the Application

### Start Backend Server

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```
The API will be available at `http://localhost:8000` (Swagger UI at `/docs`)

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:5173`

---

## API Reference

### Authentication & Profile
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register a new user |
| `/auth/login` | POST | Authenticate and retrieve JWT token |
| `/auth/me` | GET | Retrieve current user profile |
| `/auth/avatar/upload`| POST | Secure Cloudinary avatar upload |

### Expenses & Categories
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/expenses` | GET/POST | List all expenses or create a new one |
| `/expenses/{id}` | PUT/DELETE| Update or delete a specific expense |
| `/categories` | GET/POST | List or create custom categories |

### Analytics & Reports
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dashboard` | GET | Fetch aggregated dashboard metrics |
| `/budget` | GET/POST | Fetch or update the current month's budget |
| `/reports/excel` | GET | Download styled Excel report |
| `/reports/csv` | GET | Download CSV data dump |

---

## Production Roadmap

1. **Database Migration**: Switch local SQLite database to a managed PostgreSQL instance (e.g., Supabase, Neon) for persistence across server restarts.
2. **Advanced AI Analytics**: Implement machine learning to predict future spending patterns based on historical data.
3. **Receipt Scanning**: Integrate OCR (Optical Character Recognition) to automatically parse and add expenses from uploaded bill photos.
4. **Multi-Currency Support**: Add real-time exchange rates for tracking expenses during international travel.

---

## License

Copyright (c) 2026 Mukul Sharma. All Rights Reserved.

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
