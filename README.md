# Aurora Classroom — Academic Intelligence
### PS-04: Intelligent Faculty–Student Academic Collaboration Platform
**Prototype for Hackathon 2026**

---

## 🌟 Executive Summary

**Aurora Classroom** is an intelligent, accessible academic collaboration platform uniting course materials, assignments, rubric-based assessments, student submissions, actionable feedback, topic-level learning analytics, and explainable academic support into one cohesive experience.

### Core Workflow
$$\text{Faculty Activities} \longrightarrow \text{Student Interaction} \longrightarrow \text{Academic Data} \longrightarrow \text{Performance Analysis} \longrightarrow \text{Personalized Recommendations} \longrightarrow \text{Actionable Faculty Insights}$$

---

## 🎨 Visual Identity: “Aurora Classroom”

The design system incorporates a calm, focused academic aesthetic featuring generous whitespace, clear visual hierarchy, and restrained, intentional color use meeting **WCAG 2.1 AA** contrast standards:

| Token Name | Hex Code | Purpose | Contrast on White |
| :--- | :--- | :--- | :--- |
| **Ink Navy** | `#17233B` | Primary text, headings & primary navigation | **12.4 : 1** (AAA) |
| **Deep Teal** | `#0B6B69` | Primary action buttons, focused accents & progress links | **5.8 : 1** (AA) |
| **Aurora Mint** | `#B8F0D2` | Positive progress, mastery badges, selected highlights | Non-text / Fill |
| **Warm Coral** | `#F07865` | Urgent risk indicators, critical alerts & late warnings | **3.2 : 1** (Paired with icon & text) |
| **Golden Saffron**| `#E5B44C` | Attention items, pending grading, moderate risk states | Non-text / Fill |
| **Mist Background**| `#F5F7F4` | Clean canvas background | Base neutral |
| **Surface White** | `#FFFFFF` | Card containers, modals & data sheets | Base neutral |
| **Muted Slate** | `#64748B` | Secondary captions, metadata, timestamps | **4.6 : 1** (AA) |
| **Border** | `#DCE4E1` | Card outlines, dividers & table boundaries | 1px clean grid |

> **Accessibility Assurance**: Status indicators **never** rely solely on color. Every indicator pairs color with semantic text badges (e.g., `HIGH RISK`, `CRITICAL`), icons (e.g., warning triangles), and screen-reader accessibility labels (`.sr-only`). Skip navigation and visible focus rings (`:focus-visible`) are enforced throughout.

---

## 📁 Repository Structure

Both the frontend and backend are integrated in this unified folder:

```text
Academic intellegence/
├── frontend/                     # Next.js App Router (TypeScript, Tailwind CSS)
│   ├── src/
│   │   ├── app/                  # App Router pages and layouts
│   │   │   ├── (authenticated)/  # Role-guarded dashboard, courses, alerts, etc.
│   │   │   │   ├── dashboard/    # Student, Faculty, Dean & Admin dashboards
│   │   │   │   ├── courses/      # Course catalog and course detail
│   │   │   │   ├── assignments/  # Assignment instructions, rubric, submission
│   │   │   │   ├── submissions/  # Rubric grading and feedback viewer
│   │   │   │   ├── students/     # Student profile & explainable risk breakdown
│   │   │   │   ├── alerts/       # Faculty & Dean actionable alerts center
│   │   │   │   └── recommendations/ # Personalized practice recommendations
│   │   │   ├── login/            # Role quick-login & credential authentication
│   │   │   ├── globals.css       # Aurora Classroom design tokens & utilities
│   │   │   └── layout.tsx        # Root HTML wrapper with skip-nav
│   │   ├── components/           # Reusable UI, AppShell, and Recharts charts
│   │   └── lib/
│   │       ├── api/              # Strongly-typed API client layer (client.ts)
│   │       ├── auth/             # React authentication context & state
│   │       ├── validation/       # Zod client-side form validation schemas
│   │       ├── types/            # TypeScript domain interfaces matching backend
│   │       └── demo-data.ts      # Offline scenario dataset
│   ├── tests/                    # Frontend automated tests (21 tests)
│   ├── package.json              # Next.js 16, React 19, Tailwind CSS 4, Recharts
│   └── .env.example              # Frontend environment variables
│
├── backend/                      # FastAPI REST Backend (Python 3.12+, SQLAlchemy 2)
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py           # Dependency injection, JWT decoding, RBAC guards
│   │   │   └── routers/          # Domain REST route handlers (12 routers)
│   │   ├── services/
│   │   │   └── analytics_service.py # Explainable risk & recommendation scoring
│   │   ├── config.py             # Pydantic Settings & environment loader
│   │   ├── database.py           # Async SQLAlchemy engine & session factory
│   │   ├── models.py             # Relational ORM models (UUID, JSON, indexes)
│   │   ├── schemas.py            # Pydantic v2 camelCase request/response schemas
│   │   ├── security.py           # Modern bcrypt password hashing & JWT tokens
│   │   ├── seed.py               # Deterministic development seed scenario
│   │   └── main.py               # FastAPI entry point & CORS configuration
│   ├── tests/                    # Backend automated pytest suite (15 tests)
│   ├── requirements.txt          # Python dependencies
│   ├── alembic/                  # Database migration versions
│   └── Dockerfile                # Backend container definition
│
├── docker-compose.yml            # Multi-container orchestration (PostgreSQL + API + UI)
├── .env.example                  # Root environment template
├── start-dev.bat                 # One-click Windows dev server launcher
├── test-all.bat                  # One-click test runner (Backend + Frontend)
└── README.md                     # Comprehensive platform documentation
```

---

## 👥 Supported Roles & Features

### 1. `STUDENT` (e.g. Priya Sharma — `student@aurora.dev`)
- **Student Dashboard**: Upcoming assignment deadlines, course enrollment, average grade score, topic mastery chart, active recommendations, and recent activity log.
- **Course Detail**: Modules, learning resources with topic tags, published announcements, assignments, and scheduled assessments.
- **Assignment Submissions**: Submission status, rubric criteria viewer, file URL or written response submission, and graded feedback once published.
- **Topic-Level Performance**: Strengths (e.g., *Divide & Conquer 78%*) vs. areas needing improvement (*Algorithm Complexity 52%*, *Dynamic Programming 48%*).
- **Personalized Recommendations**: Rule-based remedial suggestions with direct links to tagged micro-modules and targeted drills. Students can mark recommendations as `IN_PROGRESS` or `COMPLETED`.

### 2. `FACULTY` (e.g. Dr. James Chen — `faculty@aurora.dev`)
- **Faculty Dashboard**: Course overview, pending submissions requiring grading, student risk alerts, and active academic interventions.
- **Rubric-Based Grading**: View submission content, apply scores across weighted criteria, write feedback, and publish grades.
- **Student Risk Profile**: Comprehensive topic performance, engagement trend trajectory, and transparent evidence backing each risk indicator.
- **Intervention Tracking**: Create and manage academic interventions (`TUTORING`, `CHECK_IN`, `RESOURCE_ASSIGNMENT`, `PEER_SUPPORT`), assign due dates, record session notes, and document outcomes.
- **Actionable Alerts**: Immediate notification of repeated late submissions and topic-level difficulties, with one-click acknowledgement.

### 3. `DEAN` (e.g. Dean Maria Lopez — `dean@aurora.dev`)
- **Cohort Academic Analytics**: Aggregated course enrollment, cohort-wide completion rates, risk level distribution (`LOW`, `MEDIUM`, `HIGH`), and submission timeliness metrics (on-time vs. late vs. missing).
- **Intervention Outcomes**: Track college-wide intervention completion rates without exposing unauthorized individual student data.

### 4. `ADMIN` (e.g. Sys Admin — `admin@aurora.dev`)
- **User & Role Administration**: Manage system users, assign or revoke roles (`STUDENT`, `FACULTY`, `DEAN`, `ADMIN`), toggle user status (`ACTIVE`, `INACTIVE`), and view platform oversight metrics.

---

## 🔬 Illustrative Research Scenario Walkthrough

The platform ships pre-configured with the research scenario specified in the prompt:

- **Student**: Priya Sharma (`student@aurora.dev`)
- **Course**: CS-301: Advanced Algorithms and Data Structures
- **Observed Academic Signals**:
  1. **52% Midterm Assessment Score** on *Algorithm Complexity* (Class benchmark: 76%).
  2. **Three Consecutive Late Submissions**: Assignments 1, 2, and 3 submitted past deadline.
  3. **Topic Struggles**: Dynamic Programming scored at 48% and Graph Theory at 55%.
- **Explainable Risk Scoring Engine**:
  - Composite Risk Score: **74.5 / 100** (`HIGH RISK`).
  - Transparent Indicators:
    - `ASSESSMENT_COMPLEXITY_LOW` (weight 0.35, contribution 28.5 points)
    - `CONSECUTIVE_LATE_SUBMISSIONS` (weight 0.40, contribution 40.0 points)
    - `TOPIC_STRUGGLE_DP_GRAPHS` (weight 0.25, contribution 22.0 points)
  - Plain-Language Explanation: Explains how difficulty transitioning from recursive subproblems to state-transition memoization contributes to delays.
  - Faculty Context Reminder: Faculty are advised to review individual circumstances before taking action.
- **Generated Remediation & Support**:
  - **Rule-based Student Recommendation**: *"Memoization micro-modules and targeted practice"* (linked to *Memoization Guide* and interactive practice drills).
  - **Actionable Faculty Alert**: *"Priya Sharma: 3 Consecutive Late Submissions"* (Severity: `CRITICAL`).
  - **Tracked Academic Intervention**: *"One-to-one Tutoring Check-in"* assigned to Dr. James Chen (`PLANNED`).

---

## 🔑 Demo Accounts (Development Only)

All accounts share the default development password: **`demo1234`**

| Role | Email | Name | Context |
| :--- | :--- | :--- | :--- |
| **Student** | `student@aurora.dev` | Priya Sharma | At-Risk Research Scenario Student |
| **Faculty** | `faculty@aurora.dev` | Dr. James Chen | CS-301 Course Instructor |
| **Dean** | `dean@aurora.dev` | Dean Maria Lopez | Academic Dean |
| **Admin** | `admin@aurora.dev` | Sys Admin | Platform Administrator |
| **Peer Student**| `marcus@aurora.dev`| Marcus Vance | On-time, high-performing student |

*(Quick-login buttons for all roles are provided directly on the sign-in screen.)*

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher; v20/v24 recommended)
- **Python** (3.12 or higher)
- **npm** (v9+)
- (Optional) **Docker & Docker Compose**

---

### Option A: Local Development Setup

#### 1. Setup Backend
```bash
cd backend

# Create and activate virtual environment (if not already created)
python -m venv venv
.\venv\Scripts\activate      # Windows (or: source venv/bin/activate on Unix)

# Install dependencies
pip install -r requirements.txt

# Seed the database with the research scenario
python -m app.seed

# Run the backend API server
uvicorn app.main:app --reload --port 8000
```
Backend API will be accessible at: `http://localhost:8000`  
Interactive OpenAPI documentation: `http://localhost:8000/api/v1/docs`

#### 2. Setup Frontend
In a separate terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
Frontend application will be accessible at: `http://localhost:3000`

---

### Option B: Docker Compose Setup

Run the full stack (PostgreSQL, FastAPI, Next.js) with a single command:
```bash
docker-compose up --build
```

---

## 🧪 Automated Verification & Testing

Both frontend and backend include automated test suites.

### Running All Checks with One Command (Windows)
```bash
.\test-all.bat
```

### Backend Automated Tests (Pytest)
```bash
cd backend
.\venv\Scripts\python.exe -m pytest -v
```
**Results: 15 passed in 3.83s**
- `tests/test_auth.py`: Login authentication, JWT token generation, invalid password 401 handling, `/auth/me` user retrieval, unauthorized access rejection.
- `tests/test_rbac.py`: Role-based access control, students prevented from grading (403), students prevented from viewing unauthorized records (403), faculty grading authorized, admin user management isolation.
- `tests/test_risk_engine.py`: Deterministic explainable risk engine validation for the 52% Algorithm Complexity and 3 late assignments scenario, weight normalization, risk level classification, and explainable indicator attribute verification.
- `tests/test_api_contracts.py`: Courses, learning resources, assignments, submissions, assessments, topic scores, analytics endpoints, recommendations status workflow, alert acknowledgement, and intervention lifecycle.

### Frontend Automated Tests (tsx)
```bash
cd frontend
npm test
```
**Results: 21 passed in 4.35s**
- `tests/accessibility.test.ts`: WCAG 2.1 AA color token contrast calculations (Ink Navy on white: 12.4:1; Deep Teal on white: 5.8:1), `.skip-nav` presence, `:focus-visible` ring verification, `.sr-only` class validation, non-color status cues.
- `tests/api-client.test.ts`: Centralized typed API client tests for authentication, course loading, submissions, alert acknowledgements, recommendation updates, intervention outcomes, and explainable risk data parsing.
- `tests/role-views.test.ts`: Role-aware access matrices for Student, Faculty, Dean, and Admin routes.
- `tests/validation.test.ts`: Zod validation schemas for login, assignment submission, rubric grading, intervention creation, and course creation.

### Production Build Check
```bash
cd frontend
npm run build
```
**Result: Successfully compiled and optimized all 13 routes with zero type errors or lint failures.**

---

## 🔒 Security and Implementation Assumptions

1. **Defense-in-Depth Authorization**: The frontend provides role-aware route guards and UI affordances for usability, but **every backend endpoint strictly enforces authorization, ownership, and course membership** before returning data or executing mutations.
2. **In-Memory JWT Storage**: Access tokens are kept in memory by the API client and session storage for the demo tab session—never stored in long-lived unencrypted persistent storage.
3. **Transparent Explainability**: The platform strictly avoids claiming an opaque "black-box AI" exists; prototype analytics and recommendations are transparently presented as deterministic rule-based algorithms with traceable evidence links.
4. **Dual Data Modes**: The Next.js frontend supports running seamlessly against either the live FastAPI backend (`NEXT_PUBLIC_DEMO_MODE=false`) or fully standalone offline (`NEXT_PUBLIC_DEMO_MODE=true`).
