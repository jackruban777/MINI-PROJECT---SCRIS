# SCRIS — Student Course Completion Risk and Intervention System

A comprehensive, production-grade academic monitoring and student intervention web application designed for colleges and universities.

SCRIS provides transparent academic risk indicators, subject-level prioritization, and proactive intervention tracking to protect student graduation timelines without relying on unverified black-box predictions.

---

## 🏛️ Key Architecture & Core Principles

1. **Role-Specific Portal Experiences:**
   - **Student Portal:** Personal performance metrics, CGPA/SGPA, course completion risk scores, pending arrears, attendance percentages, subject focus targets, timetables, and official PDF progress reports.
   - **Teacher Portal:** Department and class-level analytics, searchable student directory, prioritized at-risk rosters, subject difficulty comparisons, formal intervention tracking, and authorized CSV data exports.

2. **Strict Read-Only Academic Records:**
   - Academic records (internal marks, semester grades, attendance, and credits) are maintained strictly read-only in both portals.
   - No manual marks-entry or attendance-entry forms exist, preserving data integrity and preventing grade tampering. Data is fed directly from institutional database integrations or automated seed scripts.

3. **Academic Risk Engine (Deterministic & Transparent):**
   - Calculates a normalized composite risk index from 0 to 100:
     - **Internal Academic Performance:** 35%
     - **Pending Arrears Burden:** 30%
     - **Cumulative GPA & Academic Trend:** 15%
     - **Class Attendance Adherence:** 15%
     - **Sub-Threshold / Missed Assessments:** 5%
   - **Risk Classifications:**
     - 🟢 **Safe:** 0 – 34 (Healthy course completion trajectory)
     - 🟡 **Watch:** 35 – 64 (Early intervention advised)
     - 🔴 **Critical:** 65 – 100 (Urgent formal intervention required)
   - Incomplete data is handled transparently without penalizing uncommenced assessment cycles.

4. **Professional Academic Design System:**
   - Clean academic blue-and-white SaaS aesthetic (Primary Blue `#2563EB`, Navy `#1E3A5F`, Light Blue `#EFF6FF`, White `#FFFFFF`, Page Background `#F8FAFC`, Borders `#E2E8F0`).
   - Solid surfaces, high contrast, zero glassmorphism, zero neon glows, zero floating glass panels.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, React Router 7, Tailwind CSS, Lucide React, TanStack Query, Recharts |
| **Backend** | Node.js, Express, TypeScript, REST API (`/api/v1`), Zod validation, JWT with HTTP-only cookies, bcrypt |
| **Database** | SQLite (zero-config local) / PostgreSQL compatible, Prisma ORM, Prisma Client, Prisma Migrations |
| **Document Export** | PDFKit (Student Academic Reports), CSV Streaming (Faculty Cohort Reports) |
| **Notifications** | Nodemailer with dry-run audit logging and event deduplication key |
| **Testing** | Vitest (Unit & Integration tests) |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js:** v18+ (tested on v25.2.1)
- **npm:** v9+

### 1. Installation
Clone or navigate to the repository folder:
```bash
cd "SCRIS PROJECT"
```

Install backend dependencies:
```bash
cd server
npm install
```

Install frontend dependencies:
```bash
cd ../client
npm install --legacy-peer-deps
```

### 2. Database Migration & Demonstration Data
Initialize the database schema and populate realistic demonstration data (~60 students across 2 departments, assessments, attendance, arrears, timetables, and interventions):
```bash
cd ../server
npm run prisma:generate
npm run prisma:push
npm run seed
```

### 3. Start the Servers

**Backend API Server (Port 5001):**
```bash
cd server
npm run dev
```

**Frontend Client (Port 5173 or 5174):**
```bash
cd client
npm run dev
```

Open your browser at `http://localhost:5174/` (or `http://localhost:5173/`).

---

## 🔐 Demonstration Accounts

Quick-fill buttons are provided directly on the Login page (`/login`) for convenience:

### Student Accounts
| Account | Email | Password | Academic Profile |
|---|---|---|---|
| **Arjun Kumar** | `arjun.kumar@student.scris.edu` | `student123` | **Critical Risk** (Sem 5 CSE, 3 Arrears, Low Attendance) |
| **Priya Nair** | `priya.nair@student.scris.edu` | `student123` | **Watch Risk** (Sem 5 IT, 1 Arrear, Borderline Internals) |
| **Rohit Verma** | `rohit.verma@student.scris.edu` | `student123` | **Safe Achiever** (Sem 5 CSE, CGPA 9.12, 0 Arrears) |

### Faculty Accounts
| Account | Email | Password | Role & Scope |
|---|---|---|---|
| **Prof. Rajesh Sharma** | `prof.sharma@scris.edu` | `faculty123` | Professor & HOD, Computer Science and Engineering |
| **Dr. Anita Desai** | `dr.anita@scris.edu` | `faculty123` | Associate Professor & Advisor, Information Technology |

*Faculty Onboarding Key (if registering new faculty):* `SCRIS-FACULTY-2026`

---

## 🧪 Automated Testing

Run the automated backend test suite (covering SGPA/CGPA formulas, 10-point grade mappings, and risk calculations):
```bash
cd server
npm test
```

Run TypeScript compilation check:
```bash
cd server
npm run build
```

Run Frontend production build check:
```bash
cd client
npm run build
```

---

## 📁 Project Structure

```
SCRIS PROJECT/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # StatCard, RiskBadge, Modal, EmptyState, RouteGuards
│   │   │   └── layout/         # StudentLayout, TeacherLayout
│   │   ├── contexts/           # AuthContext (JWT session management)
│   │   ├── lib/                # API client wrapper
│   │   ├── pages/
│   │   │   ├── auth/           # Login, RegisterStudent, RegisterTeacher, ForgotPassword
│   │   │   ├── student/        # 10 Student Portal views
│   │   │   ├── teacher/        # 11 Teacher Portal views
│   │   │   └── LandingPage.tsx # Public SaaS landing page
│   │   ├── types/              # TypeScript models
│   │   ├── App.tsx             # Main router
│   │   └── index.css           # Academic CSS tokens & utilities
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                     # Backend Application
│   ├── prisma/
│   │   ├── schema.prisma       # Normalized academic schema
│   │   └── seed.ts             # 60-student repeatable seed script
│   ├── src/
│   │   ├── config/             # Environment & risk engine weights
│   │   ├── lib/                # Prisma, JWT, EmailService, PDFReportService, CSVExport
│   │   ├── middlewares/        # Auth, Role, Validate, ErrorHandler
│   │   ├── routes/             # auth, student, teacher, reports, system
│   │   ├── services/           # AcademicRiskEngine & calculations
│   │   └── index.ts            # Server entry point
│   ├── tsconfig.json
│   └── package.json
├── .env.example                # Documented configuration template
├── README.md                   # System documentation
└── PROJECT_STATUS.md           # Implementation verification log
```

---

## 🔒 Security & Privacy Features

- **HTTP-Only Cookies:** JWT authentication tokens are transmitted via secure HTTP-only cookies with `SameSite=lax` protection.
- **Strict Scope Authorization:** Students are cryptographically locked to their own user identifier. Teachers are restricted to viewing students within their authorized department.
- **Audit Logging:** Sensitive actions (logins, report downloads, intervention creation) are persisted to the `AuditLog` database table.
- **Input Validation:** All API endpoints validate request payloads with Zod schemas.
- **Dry-Run Email Dispatch:** Email alerts run safely in dry-run mode unless production SMTP credentials are provided, preventing application crashes.

---

## 📄 License
Educational & Institutional Use License.
