<div align="center">

  <img src="https://img.shields.io/badge/JobPilot-Job%20Application%20Tracker-7c3aed?style=for-the-badge&logo=target&logoColor=white" alt="JobPilot" />

  <br />
  <br />

  <p align="center">
    A full-stack MERN application to track every step of your job search —
    from application to offer.
  </p>

  <p align="center">
    <a href="https://jobpilot-demo.vercel.app" target="_blank">
      <img src="https://img.shields.io/badge/Live%20Demo-View%20App-7c3aed?style=for-the-badge&logo=vercel&logoColor=white" />
    </a>
    &nbsp;
    <img src="https://img.shields.io/badge/License-MIT-22d3ee?style=for-the-badge" />
    &nbsp;
    <img src="https://img.shields.io/badge/PRs-Welcome-10b981?style=for-the-badge" />
  </p>

  <br />

  <p align="center">
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" />
    <img src="https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white" />
    <img src="https://img.shields.io/badge/Express.js-4-000000?style=flat-square&logo=express&logoColor=white" />
    <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
    <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" />
    <img src="https://img.shields.io/badge/JWT-Auth-F7B500?style=flat-square&logo=jsonwebtokens&logoColor=white" />
    <img src="https://img.shields.io/badge/Deployed%20on-Render%20%2B%20Vercel-7c3aed?style=flat-square&logo=render&logoColor=white" />
  </p>

</div>

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Demo Data](#demo-data)
- [Deployment](#deployment)
- [Learning Outcomes](#learning-outcomes)
- [License](#license)
- [Author](#author)

---

## About the Project

**JobPilot** is a production-grade full-stack web application designed to eliminate the chaos of managing a job search across spreadsheets, emails, and sticky notes.

Every piece of the recruitment pipeline — applications, companies, interviews, and follow-up reminders — lives in one organized dashboard. Built with the MERN stack, JobPilot features secure JWT authentication, real-time search and filtering, a MongoDB aggregation-powered analytics dashboard, and a fully responsive design that works across all screen sizes.

New users are instantly onboarded with realistic demo data the moment they register, so there is no setup friction — the full feature set is explorable from the first login.

---

## Features

### ✨ Authentication
- Secure user registration and login via **JWT** (JSON Web Tokens)
- HTTP-only cookie + Bearer token dual-support
- Passwords hashed with **bcryptjs**
- Protected routes with automatic redirect for unauthenticated users
- Persistent sessions across page refreshes

### 📋 Job Application Management
- Create, read, update, and delete job applications
- Track status across the full pipeline: **Applied → Screening → Interviewing → Technical Round → HR Round → Offer → Rejected**
- Full status history with timestamps on every transition
- Store job title, company, salary range, job type, location, priority, tags, notes, and job URL
- Archive completed applications without deletion

### 🏢 Company Management
- Maintain a CRM-style company database linked to applications
- Store industry, location, company size, website, and internal notes
- Add multiple **recruiter contacts** (name, email, phone, LinkedIn, designation) per company
- View all applications submitted to each company from the detail panel

### 📅 Interview Scheduling
- Schedule and track interviews linked to specific applications
- Record interview type (Phone Screen, Technical, System Design, Behavioral, HR, and more)
- Log interviewers, meeting mode (Online / In-Person / Phone), location or meeting link, and duration
- Add post-interview **feedback and a 1–5 star rating**
- Inline status updates directly from the table (Scheduled → Completed → Cancelled → Rescheduled)
- Preparation notes stored per interview

### ⏰ Reminder Management
- Create follow-up reminders, deadlines, and interview prep tasks
- Link reminders to specific applications
- **Overdue** and **due-soon** notification badges with one-click quick filters
- One-tap complete/incomplete toggle with optimistic UI updates
- Priority levels (Low / Medium / High) for triage

### 📊 Dashboard & Analytics
- At-a-glance stats: Total Applications, Interviews, Offers, Rejections
- **Application trend** — line chart of submissions over time
- **Status breakdown** — donut chart of pipeline distribution
- **Interview conversion rate** and **offer success rate** — bar chart and radial chart
- **Company-wise analytics** — horizontal bar chart and top-5 ranked list
- All chart data powered by **MongoDB aggregation pipelines**
- Recent activity feed: latest applications, upcoming interviews, active reminders

### 🔍 Search & Filters
- Full-text search across job title, company, notes, and tags
- Multi-field filters: status, job type, priority, interview type, reminder type
- Quick filter toggles for overdue and upcoming reminders
- Server-side pagination with configurable page size
- Sortable columns with ascending/descending order

### 📱 Responsive Design
- Mobile-first layout with **three-tier responsive Sidebar**:
  - Slide-out drawer on mobile
  - Collapsed icon-only rail on tablet
  - Full labeled sidebar on desktop
- Mobile card views replace data tables on small screens
- Touch-friendly interactions and accessible keyboard navigation

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| React Router DOM v6 | Client-side routing |
| Axios | HTTP client with JWT interceptors |
| Tailwind CSS v4 | Utility-first styling |
| Vite | Build tool and dev server |
| Recharts | Analytics charts |
| react-hot-toast | Toast notifications |
| Context API | Global authentication state |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | HTTP server and REST API |
| MongoDB Atlas | Cloud database |
| Mongoose | ODM and schema validation |
| JSON Web Tokens | Stateless authentication |
| bcryptjs | Password hashing |
| express-validator | Request validation |
| Helmet | Security headers |
| express-rate-limit | Rate limiting (general + auth-specific) |
| CORS | Cross-origin access control |

### Deployment
| Service | Role |
|---|---|
| Vercel | Frontend hosting (static SPA) |
| Render | Backend Node.js web service |
| MongoDB Atlas | Managed cloud database (M0 free tier) |

---

## Folder Structure

```text
jobpilot/
│
├── jobpilot-backend/
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   └── envValidator.js          # Startup environment validation
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── companyController.js
│   │   ├── interviewController.js
│   │   ├── reminderController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT protect middleware
│   │   ├── errorMiddleware.js       # Global error handler
│   │   └── securityMiddleware.js    # Helmet, CORS, rate limiters
│   ├── models/
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Company.js
│   │   ├── Interview.js
│   │   └── Reminder.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── companyRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── reminderRoutes.js
│   │   └── analyticsRoutes.js
│   ├── seed/
│   │   └── seedUser.js              # Demo data seeded on registration
│   ├── utils/
│   │   └── generateToken.js
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── jobValidator.js
│   │   ├── companyValidator.js
│   │   ├── interviewValidator.js
│   │   └── reminderValidator.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── jobpilot-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ApplicationFormModal.jsx
│   │   │   ├── ApplicationsTable.jsx
│   │   │   ├── ApplicationsByMonthChart.jsx
│   │   │   ├── ApplicationsByStatusChart.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── CompaniesTable.jsx
│   │   │   ├── CompanyApplicationsChart.jsx
│   │   │   ├── CompanyFormModal.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── DashboardCard.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ErrorState.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   ├── InterviewConversionChart.jsx
│   │   │   ├── InterviewFormModal.jsx
│   │   │   ├── InterviewsTable.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── OfferSuccessChart.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RecentActivity.jsx
│   │   │   ├── ReminderFormModal.jsx
│   │   │   ├── RemindersTable.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatsSection.jsx
│   │   │   ├── TopCompaniesChart.jsx
│   │   │   └── icons.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useFormValidation.js
│   │   ├── pages/
│   │   │   ├── Applications.jsx
│   │   │   ├── Companies.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Interviews.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Reminders.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── analyticsService.js
│   │   │   ├── applicationService.js
│   │   │   ├── companyService.js
│   │   │   ├── dashboardService.js
│   │   │   ├── interviewService.js
│   │   │   └── reminderService.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── format.js
│   │   │   ├── toast.js
│   │   │   ├── validationUtils.js
│   │   │   └── validators.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **MongoDB Atlas** account (free M0 cluster is sufficient)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/jobpilot.git
cd jobpilot
```

### 2. Backend Setup

```bash
cd jobpilot-backend
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables section)
npm run dev
```

The API server starts at `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal:

```bash
cd jobpilot-frontend
npm install
cp .env.example .env
# VITE_API_URL can be left blank for local development
npm run dev
```

The app opens at `http://localhost:3000`. Vite proxies all `/api` requests to the backend automatically — no CORS configuration needed locally.

---

## Environment Variables

### Backend — `jobpilot-backend/.env`

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/jobpilot?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_strong_random_64_character_string
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000
```

> Generate a strong `JWT_SECRET`:
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
> ```

### Frontend — `jobpilot-frontend/.env`

```env
# Leave blank for local development — Vite proxies /api to localhost:5000
# Set to your Render backend URL for production builds
VITE_API_URL=
```

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header or the `jwt` HTTP-only cookie set at login.

### Authentication
> Rate-limited to **10 requests / 15 min** on register and login.

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/auth/register` | — | Register a new user (triggers demo data seed) |
| `POST` | `/api/auth/login` | — | Authenticate and receive a JWT |
| `GET` | `/api/auth/me` | ✅ | Return the authenticated user's profile |
| `POST` | `/api/auth/logout` | ✅ | Clear the auth cookie |

### Job Applications
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/jobs` | List applications — supports `search`, `status`, `jobType`, `priority`, `page`, `limit`, `sortBy` |
| `GET` | `/api/jobs/stats` | Application counts grouped by status |
| `GET` | `/api/jobs/:id` | Get one application with linked interviews and reminders |
| `POST` | `/api/jobs` | Create a new application |
| `PUT` | `/api/jobs/:id` | Update an application |
| `PATCH` | `/api/jobs/:id/status` | Update status only (appends to status history) |
| `DELETE` | `/api/jobs/:id` | Delete application and cascade to interviews and reminders |

### Companies
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/companies` | List companies — supports `search`, `page`, `limit` |
| `GET` | `/api/companies/:id` | Get one company with linked application count |
| `POST` | `/api/companies` | Create a company |
| `PUT` | `/api/companies/:id` | Update a company |
| `DELETE` | `/api/companies/:id` | Delete company (unlinks but does not delete applications) |
| `POST` | `/api/companies/:id/recruiters` | Add a recruiter contact to a company |

### Interviews
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/interviews` | List interviews — supports `job`, `status`, `type`, `upcoming`, `page`, `limit` |
| `GET` | `/api/interviews/:id` | Get one interview |
| `POST` | `/api/interviews` | Schedule an interview |
| `PUT` | `/api/interviews/:id` | Update interview details |
| `PATCH` | `/api/interviews/:id/status` | Update status only |
| `PATCH` | `/api/interviews/:id/feedback` | Add or update feedback and rating |
| `DELETE` | `/api/interviews/:id` | Delete an interview |

### Reminders
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reminders` | List reminders — supports `isCompleted`, `overdue`, `upcoming`, `type`, `page`, `limit` |
| `GET` | `/api/reminders/:id` | Get one reminder |
| `POST` | `/api/reminders` | Create a reminder |
| `PUT` | `/api/reminders/:id` | Update a reminder |
| `PATCH` | `/api/reminders/:id/complete` | Toggle complete / incomplete |
| `DELETE` | `/api/reminders/:id` | Delete a reminder |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/overview` | Combined dashboard payload (`?months=1-24`, `?companyLimit=1-50`) |
| `GET` | `/api/analytics/applications-by-month` | Monthly trend data |
| `GET` | `/api/analytics/applications-by-status` | Status breakdown |
| `GET` | `/api/analytics/conversion-rates` | Interview conversion and offer success rates |
| `GET` | `/api/analytics/company-wise` | Per-company application breakdown |

---

## Demo Data

Every user who registers on JobPilot is **automatically seeded with a complete, realistic dataset** — no manual setup required.

The seed script runs inside a **MongoDB transaction** immediately after account creation. If seeding fails, the transaction is fully rolled back and the user receives a clear error rather than a partially populated account.

Each new account receives:

| Resource | Count | Details |
|---|---|---|
| Companies | 20 | Google, Microsoft, Amazon, Apple, Meta, Netflix, Adobe, Oracle, IBM, Salesforce, NVIDIA, Intel, Cisco, Accenture, Deloitte, TCS, Infosys, Wipro, Capgemini, Cognizant — each with recruiter contacts |
| Job Applications | ~40 | Distributed across all 7 statuses, realistic salaries, priorities, and tags |
| Interviews | ~25 | Mix of completed, scheduled, and cancelled — full feedback and ratings on completed rounds |
| Reminders | ~20 | Follow-ups, interview prep, deadlines, and document submissions — mix of pending and completed |

This gives every new user a fully populated dashboard, working charts, and meaningful data to explore from the very first login.

---

## Deployment

### Backend on Render

1. Create a **Web Service** pointing to the `jobpilot-backend` directory.
2. Set **Build Command** to `npm install` and **Start Command** to `npm start`.
3. Add all backend environment variables in the Render dashboard.
4. Set `NODE_ENV=production`.

### Frontend on Vercel

1. Create a **Project** pointing to the `jobpilot-frontend` directory.
2. Set `VITE_API_URL` to your Render backend URL (e.g. `https://jobpilot-api.onrender.com/api`).
3. Add a `vercel.json` file to handle SPA client-side routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Post-Deployment Checklist

- [ ] `GET /api/health` returns `200` on the Render URL
- [ ] `CLIENT_URL` on Render matches the Vercel frontend URL exactly (no trailing slash)
- [ ] Register → Login → Dashboard loads with seeded data and no console errors
- [ ] No `CORS` errors in browser DevTools
- [ ] Page refresh on `/dashboard` or `/jobs` does not return a 404

---

## Learning Outcomes

Building JobPilot from the ground up provided hands-on experience across the full MERN stack and modern web development practices:

- **MERN Stack Architecture** — Designing a clean separation between a React SPA and a RESTful Express API, with Mongoose as the data layer
- **JWT Authentication** — Implementing stateless auth with HTTP-only cookies, Bearer token fallback, token refresh strategy, and protected route middleware
- **REST API Design** — Building consistent, versioned endpoints with proper HTTP status codes, error envelopes, and query-string-driven filtering and pagination
- **MongoDB & Mongoose** — Schema design with embedded sub-documents, compound indexes, text search, and multi-stage aggregation pipelines for analytics
- **Database Transactions** — Using Mongoose sessions and multi-document ACID transactions to ensure atomicity in the seed service and cascade deletes
- **React State Management** — Managing global auth state with Context API and `useReducer`, and local CRUD state with `useState` and `useCallback`
- **Responsive UI Development** — Building a three-tier responsive layout (mobile drawer, tablet icon rail, desktop sidebar) with Tailwind CSS and progressive column disclosure in data tables
- **Form Validation** — Implementing a reusable `useFormValidation` hook with mirrored client-side and server-side validation rules for email, URL, password strength, and range checks
- **Security Hardening** — Applying Helmet headers, strict CORS allowlists, tiered rate limiting, body-size caps, and startup environment validation with fail-fast behavior
- **Deployment** — Deploying a full-stack application across Vercel (frontend), Render (backend), and MongoDB Atlas (database) with production environment configuration and SPA rewrite rules

---

## 📄 License

This project was created for **learning, educational, and portfolio purposes**.

You're welcome to explore the code, use it as inspiration, or adapt it for your own projects. While attribution is appreciated, it's not required.

If you enjoyed this project or found it useful, consider leaving a ⭐ on the repository!

---

## Author

<div align="center">

  **Kirtan Chauhan**

  [![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/kirtan-chauhan-4a1314292/)
  &nbsp;
  [![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/kirtan30112004)
  &nbsp;
  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-7c3aed?style=for-the-badge&logo=vercel&logoColor=white)](https://jobpilot-beige.vercel.app/)

  <br />

  <sub>Built with ❤️ using the MERN stack</sub>

</div>