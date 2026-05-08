# DigiConnect — Project Structure

> **Stack:** NestJS (Node.js) backend + Vanilla HTML/CSS/JS frontend  
> **Architecture:** REST API backend served separately; frontend consumes APIs via `api.js`  
> **Last Updated:** April 2026

---

## Repository Root (`42_DigiConnect/`)

```
42_DigiConnect/
├── root/                        ← Main application code (backend + frontend)
│   ├── back-end/                ← NestJS REST API server
│   ├── front-end/               ← Vanilla HTML/CSS/JS client
│   ├── .gitignore
│   └── PROJECT_STRUCTURE.md     ← This file
│
├── Database/                    ← Database schemas / seed data reference
├── Figma Designs/               ← UI design assets
├── definitions.yml              ← API or domain definitions
├── DomainExpertInteraction.md   ← Domain expert notes
├── README.md                    ← Project overview
└── SRS.pdf                      ← Software Requirements Specification
```

---

## Backend (`root/back-end/`)

NestJS application with an in-memory data store. All business logic lives here.

```
back-end/
├── src/
│   ├── main.ts                         ← App entry point (bootstrap, port, Swagger)
│   ├── app.module.ts                   ← Root module (imports all feature modules)
│   ├── app.controller.ts               ← Default hello-world controller (NestJS boilerplate)
│   ├── app.service.ts                  ← Default hello-world service (NestJS boilerplate)
│   │
│   ├── data/
│   │   └── store.ts                    ← In-memory database (seed data for all entities)
│   │
│   ├── models/                         ← TypeScript interfaces for all domain entities
│   │   ├── user.model.ts               ← User (citizen, officer, supervisor, super_user, grievance)
│   │   ├── application.model.ts        ← Application with timeline & service fields
│   │   ├── grievance.model.ts          ← Grievance with history & status tracking
│   │   ├── notification.model.ts       ← Notification model
│   │   ├── service.model.ts            ← Government service definition
│   │   └── enums.ts                    ← Shared enums (Role, ApplicationStatus, GrievanceStatus, etc.)
│   │
│   ├── guards/                         ← Route guards for role-based access
│   │   ├── roles.guard.ts              ← Reads x-role header and enforces access
│   │   └── roles.decorator.ts          ← @Roles() decorator
│   │
│   ├── filters/
│   │   └── http-exception.filter.ts    ← Global HTTP exception formatter
│   │
│   ├── utils/
│   │   ├── helpers.ts                  ← generateId(), formatDate(), etc.
│   │   ├── pagination.util.ts          ← paginate() helper for list endpoints
│   │   └── aadhaar.util.ts             ← Aadhaar masking / validation utility
│   │
│   ├── users/                          ← User management module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts         ← POST /users/login, POST /users/register, GET /users, PATCH /users/:id, DELETE /users/:id
│   │   ├── users.service.ts            ← Login, register, CRUD, findOfficerByRole
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   │
│   ├── applications/                   ← Application lifecycle module
│   │   ├── applications.module.ts
│   │   ├── applications.controller.ts  ← POST /applications, GET /applications/my, GET /applications/officer/:id, PATCH /applications/:id/status
│   │   ├── applications.service.ts     ← Submit, fetch, status update with timeline & notifications
│   │   └── dto/
│   │       ├── create-application.dto.ts
│   │       └── update-status.dto.ts
│   │
│   ├── grievances/                     ← Grievance management module
│   │   ├── grievances.module.ts
│   │   ├── grievances.controller.ts    ← POST /grievances, GET /grievances, GET /grievances/my, PATCH /grievances/:id/status, PATCH /grievances/:id/reply
│   │   ├── grievances.service.ts       ← Raise, find, update status, add reply
│   │   └── dto/
│   │       ├── create-grievance.dto.ts
│   │       └── update-grievance.dto.ts
│   │
│   ├── services/                       ← Government services catalogue module
│   │   ├── services.module.ts
│   │   ├── services.controller.ts      ← GET /services, POST /services, PATCH /services/:id, PATCH /services/:id/toggle
│   │   ├── services.service.ts         ← CRUD for service catalogue
│   │   └── dto/
│   │       ├── create-service.dto.ts
│   │       └── update-service.dto.ts
│   │
│   ├── notifications/                  ← Notifications module
│   │   ├── notifications.module.ts
│   │   ├── notifications.controller.ts ← GET /notifications/my, PATCH /notifications/:id/read, PATCH /notifications/read-all
│   │   └── notifications.service.ts    ← Push, fetch, mark-read logic
│   │
│   ├── supervisor/                     ← Supervisor dashboard & review module
│   │   ├── supervisor.module.ts
│   │   ├── supervisor.controller.ts    ← GET /supervisor/dashboard, PATCH /supervisor/review/:id
│   │   └── supervisor.service.ts       ← Escalation review, dashboard stats aggregation
│   │
│   ├── super-user/                     ← Super User (admin) module
│   │   ├── super-user.module.ts
│   │   ├── super-user.controller.ts    ← GET /super-user/dashboard, GET|PATCH /super-user/settings, GET /super-user/pending-officers, PATCH /super-user/pending-officers/:id/approve|reject
│   │   └── super-user.service.ts       ← System stats, settings, officer onboarding approval
│   │
│   └── workflow/                       ← Workflow state machine module
│       ├── workflow.module.ts
│       ├── workflow.controller.ts      ← GET /workflow/config, PATCH /workflow/config
│       ├── workflow.service.ts         ← Workflow rules and transition validation
│       └── dto/
│           └── transition.dto.ts
│
├── test/
│   ├── app.e2e-spec.ts                 ← E2E test scaffold
│   └── jest-e2e.json
│
├── docs/
│   └── swagger.json                    ← Auto-generated Swagger/OpenAPI spec
│
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── eslint.config.mjs
└── .prettierrc
```

### API Summary

| Module | Base Route | Key Operations |
|--------|-----------|----------------|
| Users | `/users` | Login, Register, List, Update, Delete |
| Applications | `/applications` | Submit, My apps, Officer queue, Status update |
| Grievances | `/grievances` | Raise, My grievances, Update status, Reply |
| Services | `/services` | List, Create, Update, Toggle active |
| Notifications | `/notifications` | My notifications, Mark read |
| Supervisor | `/supervisor` | Dashboard stats, Review escalated |
| Super User | `/super-user` | System dashboard, Settings, Officer approval |
| Workflow | `/workflow` | Get/update workflow config |

> **Auth:** All protected routes use `x-role` and `x-user-id` request headers (no JWT yet).  
> **Swagger UI:** Available at `http://localhost:3000/api` when the server is running.

---

## Frontend (`root/front-end/`)

Vanilla HTML/CSS/JS multi-page application. All API calls are centralized in `api.js`.

```
front-end/
├── index.html                          ← Landing page
├── login.html                          ← Login page (all roles)
├── register.html                       ← Citizen self-registration
├── profile.html                        ← User profile page
│
├── citizen/                            ← Citizen portal pages
│   ├── citizen-dashboard.html          ← Overview: stats, recent apps, notifications
│   ├── apply-service.html              ← Multi-step application form
│   ├── my-applications.html            ← Application history & status tracking
│   ├── track-application.html          ← Single application tracker
│   ├── my-grievances.html              ← Grievance list
│   └── raise-grievance.html            ← Submit a new grievance
│
├── officer/                            ← Officer portal pages
│   ├── officer-dashboard.html          ← Queue, stats, pending review count
│   └── review-application.html         ← Full review form (approve / reject / query)
│
├── supervisor/                         ← Supervisor portal pages
│   ├── supervisor-dashboard.html       ← Escalations, SLA breaches, pending approvals
│   ├── supervisor-review.html          ← Final approval / override review
│   ├── escalated-cases.html            ← All escalated & SLA breach cases
│   └── workload-management.html        ← Officer workload & reassignment
│
├── grievance/                          ← Grievance Officer portal pages
│   ├── grievance-dashboard.html        ← Active grievance queue
│   ├── grievance-detail.html           ← Detailed grievance investigation view
│   └── grievance-history.html          ← Resolved grievances log
│
├── super-user/                         ← Super User (Admin) portal pages
│   ├── dashboard.html                  ← System-wide stats overview
│   ├── manage-users.html               ← User CRUD (all roles)
│   ├── manage-services.html            ← Service catalogue management
│   ├── officer-onboarding.html         ← Officer onboarding & approval
│   ├── audit-logs.html                 ← Full system audit log viewer
│   ├── system-settings.html            ← Platform-wide settings (SLA, notifications, security)
│   └── workflow-config.html            ← Workflow rules configuration
│
├── css/
│   ├── style.css                       ← Global design system (tokens, layout, components)
│   ├── dashboard.css                   ← Dashboard-specific styles (cards, stats, tables)
│   ├── forms.css                       ← Form elements & multi-step wizard styles
│   ├── auth.css                        ← Login / register page styles
│   └── landing.css                     ← Landing page styles
│
└── js/
    ├── api.js                          ← ★ Central API layer — all fetch() calls to backend
    ├── auth.js                         ← Login / register / session logic
    ├── navigation.js                   ← Sidebar, topbar, breadcrumbs, initPage()
    ├── dashboard.js                    ← Dashboard init functions for all roles
    ├── application.js                  ← Application form, review, status logic
    ├── grievance.js                    ← Grievance raising, listing, detail view
    ├── escalation.js                   ← Supervisor final approval & override logic
    ├── admin.js                        ← Super User CRUD pages (users, services, settings)
    ├── notifications.js                ← Notification panel rendering & mark-read
    ├── workflow.js                     ← Legacy workflow helpers (addAuditEntry, isOfficerFinalService)
    ├── state.js                        ← Legacy localStorage state helpers (being phased out)
    ├── role-manager.js                 ← Role-based UI utility helpers
    └── utils.js                        ← Shared utilities (generateId, formatDate, showToast, etc.)
```

### JavaScript Module Responsibilities

| File | Purpose |
|------|---------|
| `api.js` | **Single source of truth** for all backend calls. Every function maps to one REST endpoint. |
| `auth.js` | `initLoginPage()`, `initRegisterPage()` — calls `apiLogin()` / `apiRegister()` |
| `navigation.js` | `initPage()` used by every page to render sidebar, topbar, check auth |
| `dashboard.js` | `initCitizenDashboard()`, `initOfficerDashboard()`, `initSupervisorDashboard()`, `initAdminDashboard()`, `initGrievanceDashboard()` |
| `application.js` | `initApplyService()`, `initMyApplications()`, `initTrackApplication()`, `initReviewApplication()` |
| `grievance.js` | `initGrievanceDashboard()`, `initRaiseGrievance()`, `initMyGrievances()` |
| `escalation.js` | `initSupervisorReview()` — `submitFinal()`, `submitOverride()` via API |
| `admin.js` | `initManageUsers()`, `initManageServices()`, `initOfficerOnboarding()`, `initAuditLogs()`, `initSystemSettings()`, `initWorkflowConfig()` |

---

## Role → Pages Mapping

| Role | Portal | Key Pages |
|------|--------|-----------|
| `citizen` | `/citizen/` | Dashboard, Apply, My Applications, Grievances |
| `officer` | `/officer/` | Dashboard, Review Application |
| `supervisor` | `/supervisor/` | Dashboard, Review, Escalated Cases, Workload |
| `grievance` | `/grievance/` | Dashboard, Grievance Detail, History |
| `super_user` | `/super-user/` | Dashboard, Users, Services, Onboarding, Audit, Settings, Workflow |

---

## Data Flow

```
Browser Page
    │
    ▼
js/navigation.js → initPage()       (auth check, sidebar/topbar render)
    │
    ▼
js/[module].js → init[Page]()       (page-specific setup)
    │
    ▼
js/api.js → api[Action]()           (fetch → NestJS REST API)
    │
    ▼
back-end/src/[module]/[module].controller.ts
    │
    ▼
back-end/src/[module]/[module].service.ts
    │
    ▼
back-end/src/data/store.ts          (in-memory data store)
```

---

## Running the Project

### Start the Backend
```bash
cd root/back-end
npm install
npm run start:dev        # Starts on http://localhost:3000
                         # Swagger UI: http://localhost:3000/api
```

### Serve the Frontend
```bash
cd root/front-end
# Use any static server, e.g.:
npx serve .              # Serves on http://localhost:3000 or 5000
# OR open index.html directly in a browser
```

> Make sure the backend is running on port **3000** before using the frontend.  
> The `api.js` base URL defaults to `http://localhost:3000`.
