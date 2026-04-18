# 🏗️ UCSDP — Full Project Structure (Reference)
> **Unified Citizen Service and Delivery Platform**
> Stack: Vanilla HTML/CSS/JS (Front-end) + NestJS (Back-end)
> Level: Modular Architecture | In-Memory DB | CRUD | RBAC via Header | Swagger Docs

---

## 📁 Root Folder Layout (Professor's Required Structure)

```
root/                                 ← Git repository root
 ├── front-end/                       ← All HTML/CSS/JS files (moved here)
 ├── back-end/                        ← NestJS application
 │    └── docs/
 │         └── swagger.json           ← Auto-exported Swagger spec
 └── Videos/
      └── <team-video>.mp4            ← Demo video
```

> ⚠️ The current workspace has front-end files directly at root level.
> Before final submission, move them into `front-end/` and create `back-end/` and `Videos/` alongside.

---

## 🔁 Express → NestJS Concept Mapping

| Express Concept            | NestJS Equivalent             | File in This Project                        |
|----------------------------|-------------------------------|---------------------------------------------|
| `app.use('/auth', router)` | `@Controller('auth')`         | `controllers/auth.controller.ts`            |
| `router.get('/', handler)` | `@Get()` method               | Inside any controller                       |
| `req.body`                 | `@Body()`                     | DTO / controller param                      |
| `req.params.id`            | `@Param('id')`                | Controller param                            |
| `req.headers['x-role']`   | `@Headers('x-role')`          | Role passed via request header (no JWT)     |
| Middleware function         | `@Injectable()` Guard         | `guards/roles.guard.ts`                     |
| MVC Model (data shape)     | TypeScript interface          | `models/*.model.ts`                         |
| In-memory array/object     | Injectable service property   | `data/store.ts`                             |
| `next(err)` error handling | `@Catch()` exception filter   | `filters/http-exception.filter.ts`          |
| `res.json()`               | `return object` (NestJS auto) | Controller return value                     |
| Joi validation             | class-validator DTOs          | `dto/**/*.dto.ts`                           |

---

## 🔑 Role-Based Access Control (RBAC — No Authentication)

> Per assignment requirement: **No authentication/JWT required**.
> Roles are passed by the client as a plain HTTP request header.

```
Header: x-role: citizen
Header: x-role: officer
Header: x-role: supervisor
Header: x-role: super_user
```

The `RolesGuard` reads `req.headers['x-role']` and compares it to the `@Roles(...)` decorator on each route. Returns `403 Forbidden` if the role is not permitted.

---

```
root/
│
│ ════════════════════════════════════════════════════════════
│  SECTION 1 — FRONT-END (Vanilla HTML/CSS/JS)
│  Status: ✅ BUILT — Needs API integration (mock → real fetch)
│ ════════════════════════════════════════════════════════════
│
├── front-end/
│   │
│   │  ── Root Pages ──────────────────────────────────────
│   ├── index.html                    ← Landing / Home page
│   ├── login.html                    ← Unified login (all roles)
│   ├── register.html                 ← Citizen self-registration
│   ├── profile.html                  ← Shared profile page (all roles)
│   │
│   │  ── Super User Portal ──────────────────────────────
│   ├── super-user/                   ← Super User pages
│   │   ├── dashboard.html
│   │   ├── manage-users.html
│   │   ├── manage-services.html
│   │   ├── workflow-config.html
│   │   ├── officer-onboarding.html
│   │   ├── audit-logs.html
│   │   └── system-settings.html
│   │
│   │  ── Citizen Portal ──────────────────────────────────
│   ├── citizen/
│   │   ├── citizen-dashboard.html
│   │   ├── my-applications.html
│   │   ├── track-application.html
│   │   ├── apply-service.html
│   │   ├── raise-grievance.html
│   │   └── my-grievances.html
│   │
│   │  ── Officer Portal ──────────────────────────────────
│   ├── officer/
│   │   ├── officer-dashboard.html
│   │   └── review-application.html
│   │
│   │  ── Supervisor Portal ─────────────────────────────
│   ├── supervisor/
│   │   ├── supervisor-dashboard.html
│   │   ├── escalated-cases.html
│   │   ├── supervisor-review.html
│   │   └── workload-management.html
│   │
│   │  ── Grievance Management ──────────────────────────
│   ├── grievance/
│   │   ├── grievance-dashboard.html
│   │   ├── grievance-detail.html
│   │   └── grievance-history.html
│   │
│   │  ── Styles ──────────────────────────────────────────
│   ├── css/
│   │   ├── style.css                 ← Global base styles + CSS variables
│   │   ├── auth.css                  ← Login / Register page styles
│   │   ├── dashboard.css             ← Shared dashboard layout
│   │   ├── forms.css                 ← All form components
│   │   └── landing.css               ← Landing page (index.html)
│   │
│   │  ── JavaScript Modules ──────────────────────────────
│   ├── js/
│   │   │
│   │   │  ── KEEP (refactor to use real API) ─────────────
│   │   ├── api.js                    ← 🔥 ALL fetch() calls to NestJS backend
│   │   │                                Replaces: mock-data.js + crud.js
│   │   │                                Sends Header: x-role: <role> on every call
│   │   │
│   │   ├── auth.js                   ← Role selector UI (sessionStorage only, no JWT)
│   │   │                                login.html: dropdown → citizen/officer/supervisor/super_user
│   │   │                                On submit: sessionStorage.setItem('role', selectedRole)
│   │   │                                           sessionStorage.setItem('userId', 'CIT-001')
│   │   │                                register.html: form UI only (no backend call)
│   │   │                                KEEP: role-based redirect, profile page logic
│   │   │
│   │   ├── state.js                  ← Global state (currentUser, role)
│   │   │                                KEEP as-is; populate from API responses
│   │   │
│   │   ├── navigation.js             ← Role-based route guards (UI-side)
│   │   │                                KEEP as-is; no backend changes needed
│   │   │
│   │   ├── role-manager.js           ← Show/hide UI elements by role
│   │   │                                KEEP as-is
│   │   │
│   │   ├── application.js            ← Application form UI rendering
│   │   │                                REFACTOR: submit → POST /api/v1/applications
│   │   │                                REFACTOR: load → GET /api/v1/applications/my
│   │   │
│   │   ├── grievance.js              ← Grievance form UI rendering
│   │   │                                REFACTOR: submit → POST /api/v1/grievances
│   │   │                                REFACTOR: load → GET /api/v1/grievances/my
│   │   │
│   │   ├── dashboard.js              ← Stats cards, charts, widgets
│   │   │                                REFACTOR: load stats from real API endpoints
│   │   │
│   │   ├── escalation.js             ← Escalation UI
│   │   │                                REFACTOR: escalate → PATCH /api/v1/applications/:id/status
│   │   │
│   │   ├── workflow.js               ← Workflow step display (UI only)
│   │   │                                REFACTOR: transitions → POST /api/v1/workflow/transition
│   │   │
│   │   ├── notifications.js          ← Toast alerts, badge counters
│   │   │                                REFACTOR: load → GET /api/v1/notifications
│   │   │
│   │   └── utils.js                  ← Date format, Aadhaar mask, validators
│   │                                    KEEP as-is (pure UI utility functions)
│   │
│   │  ── Files to DELETE after backend is ready ──────────
│   │   ├── mock-data.js              ← ❌ DELETE — 897 lines of localStorage seed data
│   │   │                                Replaced by: back-end/src/data/store.ts
│   │   │                                Seeds: users, applications, grievances,
│   │   │                                       services, notifications, audit_logs,
│   │   │                                       pending_officers, officer_queue,
│   │   │                                       officer_queries, settings
│   │   │
│   │   └── crud.js                   ← ❌ DELETE — 1261 lines of localStorage CRUD
│   │                                    Replaced by: NestJS services layer
│   │                                    Contains: initManageUsers, initManageServices,
│   │                                              initWorkflowConfig, initOfficerOnboarding,
│   │                                              initAuditLogs, initSystemSettings
│   │
│   └── assets/
│       ├── images/
│       └── icons/
│
│
│ ════════════════════════════════════════════════════════════
│  SECTION 2 — BACK-END (NestJS — Modular Architecture)
│  Status: 🔲 TO BUILD
│ ════════════════════════════════════════════════════════════
│
├── back-end/
│   │
│   ├── docs/
│   │   └── swagger.json              ← Auto-generated via @nestjs/swagger
│   │                                    Run: npm run build and export via SwaggerModule
│   │
│   ├── src/
│   │   │
│   │   ├── main.ts                   ← App bootstrap
│   │   │                                app.setGlobalPrefix('api/v1')
│   │   │                                enableCors({ origin: '*' })
│   │   │                                useGlobalFilters(HttpExceptionFilter)
│   │   │                                useGlobalPipes(ValidationPipe { whitelist: true })
│   │   │                                SwaggerModule.setup('api/docs', app, document)
│   │   │
│   │   ├── app.module.ts             ← Root module
│   │   │                                Imports: UsersModule, ApplicationsModule,
│   │   │                                         GrievancesModule, ServicesModule,
│   │   │                                         WorkflowModule, SupervisorModule,
│   │   │                                         SuperUserModule, NotificationsModule
│   │   │
│   │   │ ─────────────────────────────────────────────────
│   │   │  M — MODEL LAYER
│   │   │  TypeScript interfaces = MVC Models
│   │   │  Mirrors the data shapes from mock-data.js
│   │   │ ─────────────────────────────────────────────────
│   │   │
│   │   ├── models/
│   │   │   ├── user.model.ts         ← interface User {
│   │   │   │                              id: string           // e.g. 'CIT-001', 'EMP-001'
│   │   │   │                              name: string
│   │   │   │                              email: string
│   │   │   │                              phone: string
│   │   │   │                              aadhaar: string      // raw 12-digit
│   │   │   │                              role: Role
│   │   │   │                              title?: string       // VRO, RI, MRO etc.
│   │   │   │                              dept?: string
│   │   │   │                              jurisdiction?: string
│   │   │   │                              status: 'Active' | 'Suspended' | 'Pending'
│   │   │   │                              services?: string[]  // services officer handles
│   │   │   │                              joinedDate: string
│   │   │   │                            }
│   │   │   │
│   │   │   ├── application.model.ts  ← interface Application {
│   │   │   │                              id: string           // 'APP-XXXX'
│   │   │   │                              serviceId: string
│   │   │   │                              serviceName: string
│   │   │   │                              serviceType: string  // certificate, welfare, permission
│   │   │   │                              citizenId: string
│   │   │   │                              citizenName: string
│   │   │   │                              officerId: string
│   │   │   │                              officerName: string
│   │   │   │                              dept: string
│   │   │   │                              status: AppStatus
│   │   │   │                              remarks: string
│   │   │   │                              fee: number
│   │   │   │                              paymentStatus: string
│   │   │   │                              submittedDate: string
│   │   │   │                              slaDate: string
│   │   │   │                              timeline: TimelineEntry[]
│   │   │   │                              documents: Document[]
│   │   │   │                            }
│   │   │   │
│   │   │   ├── grievance.model.ts    ← interface Grievance {
│   │   │   │                              id: string           // 'GRV-XXX'
│   │   │   │                              citizenId: string
│   │   │   │                              citizenName: string
│   │   │   │                              officerId: string
│   │   │   │                              officerName: string
│   │   │   │                              category: 'delay' | 'rejection' | 'payment' | 'misconduct'
│   │   │   │                              subject: string
│   │   │   │                              description: string
│   │   │   │                              relatedAppId: string
│   │   │   │                              status: GrievanceStatus
│   │   │   │                              priority: 'low' | 'medium' | 'high'
│   │   │   │                              slaStatus: 'safe' | 'warn' | 'breach'
│   │   │   │                              filedDate: string
│   │   │   │                              lastUpdated: string
│   │   │   │                              history: HistoryEntry[]
│   │   │   │                            }
│   │   │   │
│   │   │   ├── service.model.ts      ← interface GovtService {
│   │   │   │                              id: string           // 'SVC-XXX'
│   │   │   │                              name: string
│   │   │   │                              cat: string          // Certificate, Welfare, Permission, Correction
│   │   │   │                              dept: string
│   │   │   │                              sla: number          // days
│   │   │   │                              fee: number
│   │   │   │                              desc: string
│   │   │   │                              docs: string[]       // required document names
│   │   │   │                              stages: number
│   │   │   │                              status: 'Active' | 'Inactive' | 'Draft'
│   │   │   │                              apps: number         // total applications count
│   │   │   │                            }
│   │   │   │
│   │   │   ├── notification.model.ts ← interface Notification {
│   │   │   │                              id: string           // 'NOT-XXX'
│   │   │   │                              userId: string
│   │   │   │                              title: string
│   │   │   │                              message: string
│   │   │   │                              type: 'success' | 'warning' | 'info' | 'danger'
│   │   │   │                              read: boolean
│   │   │   │                              date: string
│   │   │   │                              link?: string
│   │   │   │                            }
│   │   │   │
│   │   │   └── enums.ts              ← enum Role {
│   │   │                                  CITIZEN = 'citizen',
│   │   │                                  OFFICER = 'officer',
│   │   │                                  SUPERVISOR = 'supervisor',
│   │   │                                  GRIEVANCE = 'grievance',
│   │   │                                  SUPER_USER = 'super_user'
│   │   │                                }
│   │   │                                enum AppStatus {
│   │   │                                  PENDING = 'pending',
│   │   │                                  UNDER_REVIEW = 'under-review',
│   │   │                                  APPROVED = 'approved',
│   │   │                                  REJECTED = 'rejected',
│   │   │                                  ESCALATED = 'escalated',
│   │   │                                  QUERY = 'query',
│   │   │                                  COMPLETED = 'completed'
│   │   │                                }
│   │   │                                enum GrievanceStatus {
│   │   │                                  OPEN = 'open',
│   │   │                                  INVESTIGATING = 'investigating',
│   │   │                                  ESCALATED = 'escalated',
│   │   │                                  RESOLVED = 'resolved',
│   │   │                                  REJECTED = 'rejected',
│   │   │                                  ESCALATED_RESOLVED = 'escalated-resolved'
│   │   │                                }
│   │   │
│   │   │ ─────────────────────────────────────────────────
│   │   │  IN-MEMORY DATABASE
│   │   │  Single source of truth — replaces mock-data.js
│   │   │  Pre-seeded with the same data currently in mock-data.js
│   │   │ ─────────────────────────────────────────────────
│   │   │
│   │   ├── data/
│   │   │   └── store.ts              ← export const db = {
│   │   │                                  users: User[],          // 14 pre-seeded users
│   │   │                                  applications: Application[],  // 16+ mock apps
│   │   │                                  grievances: Grievance[],      // 14+ mock grievances
│   │   │                                  services: GovtService[],      // 10 govt services
│   │   │                                  notifications: Notification[],// 7+ mock notifs
│   │   │                                  auditLogs: AuditLog[],        // 7+ mock logs
│   │   │                                  officerQueue: OfficerQueueItem[], // 12+ entries
│   │   │                                  pendingOfficers: PendingOfficer[], // 3 pending
│   │   │                                  settings: SystemSettings
│   │   │                                }
│   │   │                                Pre-seeded users:
│   │   │                                  Citizens: CIT-001 to CIT-005
│   │   │                                  Officers: EMP-001 to EMP-005
│   │   │                                  Supervisors: EMP-003, SUP-001, SUP-002
│   │   │                                  Grievance Officers: GRV-001, GRV-002
│   │   │                                  Super User: ADM-001 (superuser@gov.in)
│   │   │
│   │   │ ─────────────────────────────────────────────────
│   │   │  MODULES — One module per feature domain
│   │   │  Each module contains its own Controller + Service
│   │   │ ─────────────────────────────────────────────────
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts       ← @Controller('users')
│   │   │   │                                GET    /api/v1/users              [SUPER_USER]
│   │   │   │                                GET    /api/v1/users/:id          [SUPER_USER]
│   │   │   │                                POST   /api/v1/users              [SUPER_USER] (add user)
│   │   │   │                                PATCH  /api/v1/users/:id          [SUPER_USER]
│   │   │   │                                DELETE /api/v1/users/:id          [SUPER_USER]
│   │   │   │                                POST   /api/v1/users/register      [PUBLIC]
│   │   │   ├── users.service.ts          ← findAll(), findById(), create(),
│   │   │   │                                update(), suspend(), restore(),
│   │   │   │                                register()
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts    ← @IsEmail(), @IsNotEmpty(), @IsEnum(Role)
│   │   │       └── update-user.dto.ts    ← PartialType(CreateUserDto)
│   │   │
│   │   ├── applications/
│   │   │   ├── applications.module.ts
│   │   │   ├── applications.controller.ts ← @Controller('applications')
│   │   │   │                                POST  /api/v1/applications          [CITIZEN]
│   │   │   │                                GET   /api/v1/applications          [OFFICER, SUPERVISOR, SUPER_USER]
│   │   │   │                                GET   /api/v1/applications/my       [CITIZEN] ← citizenId from header
│   │   │   │                                GET   /api/v1/applications/:id      [ANY]
│   │   │   │                                GET   /api/v1/applications/track/:ref [CITIZEN]
│   │   │   │                                PATCH /api/v1/applications/:id/status [OFFICER, SUPERVISOR]
│   │   │   │                                Supports: ?page=1&limit=10
│   │   │   ├── applications.service.ts   ← submit(), findAll(), findById(),
│   │   │   │                                findByRef(), findByCitizen(),
│   │   │   │                                updateStatus(), paginate()
│   │   │   └── dto/
│   │   │       ├── create-application.dto.ts  ← @IsString() serviceId, citizenId, etc.
│   │   │       └── update-status.dto.ts       ← @IsEnum(AppStatus) status, @IsString() remarks
│   │   │
│   │   ├── grievances/
│   │   │   ├── grievances.module.ts
│   │   │   ├── grievances.controller.ts  ← @Controller('grievances')
│   │   │   │                                POST  /api/v1/grievances             [CITIZEN]
│   │   │   │                                GET   /api/v1/grievances             [OFFICER, SUPERVISOR, SUPER_USER, GRIEVANCE]
│   │   │   │                                GET   /api/v1/grievances/my          [CITIZEN]
│   │   │   │                                GET   /api/v1/grievances/:id         [ANY]
│   │   │   │                                PATCH /api/v1/grievances/:id/status  [GRIEVANCE, SUPERVISOR]
│   │   │   ├── grievances.service.ts     ← raise(), findAll(), findById(),
│   │   │   │                                findByCitizen(), updateStatus(),
│   │   │   │                                escalate(), resolve()
│   │   │   └── dto/
│   │   │       ├── create-grievance.dto.ts   ← @IsString() citizenId, category, subject, description
│   │   │       └── update-grievance.dto.ts   ← @IsEnum(GrievanceStatus) status
│   │   │
│   │   ├── services/
│   │   │   ├── services.module.ts
│   │   │   ├── services.controller.ts    ← @Controller('services')
│   │   │   │                                GET   /api/v1/services              [ANY] (active only)
│   │   │   │                                GET   /api/v1/services/all          [SUPER_USER] (all statuses)
│   │   │   │                                GET   /api/v1/services/:id          [ANY]
│   │   │   │                                POST  /api/v1/services              [SUPER_USER]
│   │   │   │                                PATCH /api/v1/services/:id          [SUPER_USER]
│   │   │   │                                PATCH /api/v1/services/:id/toggle   [SUPER_USER]
│   │   │   ├── services.service.ts       ← findAll(), findActive(), findById(),
│   │   │   │                                create(), update(), toggleStatus()
│   │   │   └── dto/
│   │   │       └── create-service.dto.ts ← @IsString() name, cat, dept, @IsNumber() sla, fee
│   │   │
│   │   ├── workflow/
│   │   │   ├── workflow.module.ts
│   │   │   ├── workflow.controller.ts    ← @Controller('workflow')
│   │   │   │                                GET  /api/v1/workflow/config          [SUPER_USER]
│   │   │   │                                POST /api/v1/workflow/transition       [OFFICER, SUPERVISOR]
│   │   │   │                                GET  /api/v1/workflow/history/:appId   [ANY]
│   │   │   │                                GET  /api/v1/workflow/audit-logs       [SUPER_USER]
│   │   │   ├── workflow.service.ts       ← getConfig(), transition(),
│   │   │   │                                validateTransition(), getHistory(),
│   │   │   │                                addAuditEntry()
│   │   │   │                                [Transition Map:]
│   │   │   │                                pending        → under-review   (OFFICER)
│   │   │   │                                under-review   → approved       (OFFICER)
│   │   │   │                                under-review   → rejected       (OFFICER)
│   │   │   │                                under-review   → escalated      (OFFICER, SUPERVISOR)
│   │   │   │                                under-review   → query          (OFFICER)
│   │   │   │                                escalated      → approved       (SUPERVISOR)
│   │   │   │                                escalated      → rejected       (SUPERVISOR)
│   │   │   │                                escalated      → under-review   (SUPERVISOR)
│   │   │   └── dto/
│   │   │       └── transition.dto.ts     ← @IsString() appId, fromStatus, toStatus, remarks
│   │   │
│   │   ├── supervisor/
│   │   │   ├── supervisor.module.ts
│   │   │   ├── supervisor.controller.ts  ← @Controller('supervisor')
│   │   │   │                                GET   /api/v1/supervisor/dashboard    [SUPERVISOR]
│   │   │   │                                GET   /api/v1/supervisor/escalated    [SUPERVISOR]
│   │   │   │                                GET   /api/v1/supervisor/workload     [SUPERVISOR]
│   │   │   │                                POST  /api/v1/supervisor/assign       [SUPERVISOR]
│   │   │   │                                PATCH /api/v1/supervisor/review/:id   [SUPERVISOR]
│   │   │   └── supervisor.service.ts     ← getDashboard(), getEscalated(),
│   │   │                                    getWorkload(), assignOfficer(), review()
│   │   │
│   │   ├── super-user/
│   │   │   ├── super-user.module.ts
│   │   │   ├── super-user.controller.ts  ← @Controller('super-user')
│   │   │   │                                GET   /api/v1/super-user/dashboard       [SUPER_USER]
│   │   │   │                                GET   /api/v1/super-user/settings        [SUPER_USER]
│   │   │   │                                PATCH /api/v1/super-user/settings        [SUPER_USER]
│   │   │   │                                POST  /api/v1/super-user/onboard-officer [SUPER_USER]
│   │   │   │                                GET   /api/v1/super-user/pending-officers [SUPER_USER]
│   │   │   │                                PATCH /api/v1/super-user/pending-officers/:id/approve [SUPER_USER]
│   │   │   │                                PATCH /api/v1/super-user/pending-officers/:id/reject  [SUPER_USER]
│   │   │   └── super-user.service.ts     ← getDashboard(), getSettings(),
│   │   │                                    updateSettings(), onboardOfficer(),
│   │   │                                    getPendingOfficers(), approveOfficer()
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts ← @Controller('notifications')
│   │   │   │                                GET   /api/v1/notifications           [ANY - filtered by userId header]
│   │   │   │                                GET   /api/v1/notifications/count     [ANY]
│   │   │   │                                PATCH /api/v1/notifications/:id/read  [ANY]
│   │   │   │                                PATCH /api/v1/notifications/read-all  [ANY]
│   │   │   └── notifications.service.ts  ← getByUser(), countUnread(),
│   │   │                                    markRead(), markAllRead(),
│   │   │                                    sendNotification()
│   │   │
│   │   │ ─────────────────────────────────────────────────
│   │   │  GUARDS — Role-based access control
│   │   │  Reads x-role header (no JWT needed)
│   │   │ ─────────────────────────────────────────────────
│   │   │
│   │   ├── guards/
│   │   │   ├── roles.guard.ts            ← @Injectable() implements CanActivate
│   │   │   │                                Reads: req.headers['x-role']
│   │   │   │                                Compares to: @Roles() decorator
│   │   │   │                                Returns 403 if role not permitted
│   │   │   └── roles.decorator.ts        ← @Roles('citizen', 'officer', ...)
│   │   │                                    SetMetadata(ROLES_KEY, roles)
│   │   │
│   │   │ ─────────────────────────────────────────────────
│   │   │  ERROR HANDLING
│   │   │ ─────────────────────────────────────────────────
│   │   │
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts  ← Catches ALL unhandled errors
│   │   │                                    Returns: {
│   │   │                                      success: false,
│   │   │                                      statusCode: number,
│   │   │                                      message: string,
│   │   │                                      timestamp: string
│   │   │                                    }
│   │   │
│   │   └── utils/
│   │       ├── helpers.ts                ← generateId(prefix), generateRefNo()
│   │       ├── aadhaar.util.ts           ← maskAadhaar('895421674301') → 'XXXX XXXX 4301'
│   │       └── pagination.util.ts        ← paginate(array, page, limit)
│   │                                        Returns: {
│   │                                          data, total, page,
│   │                                          limit, totalPages
│   │                                        }
│   │
│   ├── .env                              ← PORT=3000 (gitignored)
│   ├── .env.example                      ← PORT=3000 (committed to git)
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
│
│ ════════════════════════════════════════════════════════════
│  SECTION 3 — DOCS (Auto-generated + Manual)
│ ════════════════════════════════════════════════════════════
│
└── back-end/
    └── docs/
        └── swagger.json              ← Generated by SwaggerModule.createDocument()
                                         Accessible at: http://localhost:3000/api/docs
```

---

## 🌐 All API Routes (Quick Reference)

| Module        | Method | Route                                      | Role                              |
|---------------|--------|--------------------------------------------|-----------------------------------|
| Users         | POST   | `/api/v1/users/register`                   | PUBLIC                            |
| Users         | GET    | `/api/v1/users`                            | SUPER_USER                        |
| Users         | GET    | `/api/v1/users/:id`                        | SUPER_USER                        |
| Users         | POST   | `/api/v1/users`                            | SUPER_USER                        |
| Users         | PATCH  | `/api/v1/users/:id`                        | SUPER_USER                        |
| Users         | DELETE | `/api/v1/users/:id`                        | SUPER_USER                        |
| Applications  | POST   | `/api/v1/applications`                     | CITIZEN                           |
| Applications  | GET    | `/api/v1/applications`                     | OFFICER, SUPERVISOR, SUPER_USER   |
| Applications  | GET    | `/api/v1/applications/my`                  | CITIZEN                           |
| Applications  | GET    | `/api/v1/applications/:id`                 | ANY                               |
| Applications  | GET    | `/api/v1/applications/track/:ref`          | CITIZEN                           |
| Applications  | PATCH  | `/api/v1/applications/:id/status`          | OFFICER, SUPERVISOR               |
| Grievances    | POST   | `/api/v1/grievances`                       | CITIZEN                           |
| Grievances    | GET    | `/api/v1/grievances`                       | OFFICER, SUPERVISOR, SUPER_USER, GRIEVANCE |
| Grievances    | GET    | `/api/v1/grievances/my`                    | CITIZEN                           |
| Grievances    | GET    | `/api/v1/grievances/:id`                   | ANY                               |
| Grievances    | PATCH  | `/api/v1/grievances/:id/status`            | GRIEVANCE, SUPERVISOR             |
| Services      | GET    | `/api/v1/services`                         | ANY (active only)                 |
| Services      | GET    | `/api/v1/services/all`                     | SUPER_USER                        |
| Services      | GET    | `/api/v1/services/:id`                     | ANY                               |
| Services      | POST   | `/api/v1/services`                         | SUPER_USER                        |
| Services      | PATCH  | `/api/v1/services/:id`                     | SUPER_USER                        |
| Services      | PATCH  | `/api/v1/services/:id/toggle`              | SUPER_USER                        |
| Workflow      | GET    | `/api/v1/workflow/config`                  | SUPER_USER                        |
| Workflow      | POST   | `/api/v1/workflow/transition`              | OFFICER, SUPERVISOR               |
| Workflow      | GET    | `/api/v1/workflow/history/:appId`          | ANY                               |
| Workflow      | GET    | `/api/v1/workflow/audit-logs`              | SUPER_USER                        |
| Supervisor    | GET    | `/api/v1/supervisor/dashboard`             | SUPERVISOR                        |
| Supervisor    | GET    | `/api/v1/supervisor/escalated`             | SUPERVISOR                        |
| Supervisor    | GET    | `/api/v1/supervisor/workload`              | SUPERVISOR                        |
| Supervisor    | POST   | `/api/v1/supervisor/assign`               | SUPERVISOR                        |
| Supervisor    | PATCH  | `/api/v1/supervisor/review/:id`            | SUPERVISOR                        |
| Super User    | GET    | `/api/v1/super-user/dashboard`             | SUPER_USER                        |
| Super User    | GET    | `/api/v1/super-user/settings`              | SUPER_USER                        |
| Super User    | PATCH  | `/api/v1/super-user/settings`              | SUPER_USER                        |
| Super User    | POST   | `/api/v1/super-user/onboard-officer`       | SUPER_USER                        |
| Super User    | GET    | `/api/v1/super-user/pending-officers`      | SUPER_USER                        |
| Super User    | PATCH  | `/api/v1/super-user/pending-officers/:id/approve` | SUPER_USER               |
| Super User    | PATCH  | `/api/v1/super-user/pending-officers/:id/reject`  | SUPER_USER               |
| Notifications | GET    | `/api/v1/notifications`                    | ANY (filtered by x-user-id header)|
| Notifications | GET    | `/api/v1/notifications/count`              | ANY                               |
| Notifications | PATCH  | `/api/v1/notifications/:id/read`           | ANY                               |
| Notifications | PATCH  | `/api/v1/notifications/read-all`           | ANY                               |

---

## 📄 Pagination Pattern (for list endpoints)

```
GET /api/v1/applications?page=1&limit=10

Response:
{
  "success": true,
  "data": [ ...items... ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## 📦 Standard API Request / Response Format

```json
// Every request must include:
Headers: {
  "x-role": "citizen",          // Role of the caller
  "x-user-id": "CIT-001",       // ID of the caller (for filtered endpoints)
  "Content-Type": "application/json"
}

// Success Response
{ "success": true, "data": { ... }, "message": "OK" }

// Error Response (from http-exception.filter.ts)
{
  "success": false,
  "statusCode": 404,
  "message": "Application not found",
  "timestamp": "2025-01-28T10:00:00.000Z"
}
```

---

## 🔑 RBAC Matrix

| Module                    | Citizen | Officer | Supervisor | Grievance | Super User |
|---------------------------|:-------:|:-------:|:----------:|:---------:|:----------:|
| Register / Login          | ✅      | ✅      | ✅         | ✅        | ✅         |
| Applications (own)        | ✅      | ❌      | ❌         | ❌        | ❌         |
| Applications (all)        | ❌      | ✅      | ✅         | ❌        | ✅         |
| Update Application Status | ❌      | ✅      | ✅         | ❌        | ❌         |
| Grievances (own)          | ✅      | ❌      | ❌         | ❌        | ❌         |
| Grievances (all)          | ❌      | ✅      | ✅         | ✅        | ✅         |
| Update Grievance Status   | ❌      | ❌      | ✅         | ✅        | ❌         |
| Workflow transitions      | ❌      | ✅      | ✅         | ❌        | ❌         |
| Workflow config           | ❌      | ❌      | ❌         | ❌        | ✅         |
| Supervisor routes         | ❌      | ❌      | ✅         | ❌        | ❌         |
| Super User routes         | ❌      | ❌      | ❌         | ❌        | ✅         |
| Services (read)           | ✅      | ✅      | ✅         | ✅        | ✅         |
| Services (manage)         | ❌      | ❌      | ❌         | ❌        | ✅         |
| Notifications (own)       | ✅      | ✅      | ✅         | ✅        | ✅         |
| Notifications (all)       | ❌      | ❌      | ❌         | ❌        | ✅         |
| Users (manage)            | ❌      | ❌      | ❌         | ❌        | ✅         |
| Audit Logs                | ❌      | ❌      | ❌         | ❌        | ✅         |

---

## ⚡ Workflow State Transition Map

```
pending        → under-review     allowed by: OFFICER
under-review   → approved         allowed by: OFFICER
under-review   → rejected         allowed by: OFFICER
under-review   → escalated        allowed by: OFFICER, SUPERVISOR
under-review   → query            allowed by: OFFICER
escalated      → approved         allowed by: SUPERVISOR
escalated      → rejected         allowed by: SUPERVISOR
escalated      → under-review     allowed by: SUPERVISOR (re-assign)
```

---

## 🔄 Front-End JS Migration Plan

| Old File / Feature              | Action         | Replacement / Notes                              |
|---------------------------------|----------------|--------------------------------------------------|
| `mock-data.js` (897 lines)      | ❌ DELETE       | `back-end/src/data/store.ts`                     |
| `crud.js` (1261 lines)          | ❌ DELETE       | NestJS services layer                            |
| `js/api.js`                     | ✅ CREATE/REFACTOR | Central file for all `fetch()` calls to `/api/v1/*` |
| `js/auth.js` → login()          | ✅ REFACTOR     | Role selector dropdown → `sessionStorage.setItem('role', ...)` (no backend call) |
| `js/auth.js` → register()       | ✅ REFACTOR     | Form UI only → `sessionStorage.setItem('userId', ...)` (no backend call) |
| `js/auth.js` → initProfilePage()| ✅ REFACTOR     | GET `/api/v1/users/:id`                          |
| `js/application.js`             | ✅ REFACTOR     | GET/POST `/api/v1/applications/*`                |
| `js/grievance.js`               | ✅ REFACTOR     | GET/POST `/api/v1/grievances/*`                  |
| `js/dashboard.js`               | ✅ REFACTOR     | GET dashboard stats from respective API routes   |
| `js/escalation.js`              | ✅ REFACTOR     | PATCH `/api/v1/applications/:id/status`          |
| `js/workflow.js`                | ✅ REFACTOR     | POST `/api/v1/workflow/transition`               |
| `js/notifications.js`           | ✅ REFACTOR     | GET `/api/v1/notifications`                      |
| `js/state.js`                   | ✅ KEEP         | No backend interaction; manage sessionStorage only|
| `js/navigation.js`              | ✅ KEEP         | UI route guards; no backend needed               |
| `js/role-manager.js`            | ✅ KEEP         | UI role display; no backend needed               |
| `js/utils.js`                   | ✅ KEEP         | Pure UI helpers (date fmt, Aadhaar mask, etc.)   |

---

## 📁 Backend File Count

| Layer                         | Files  |
|-------------------------------|--------|
| Models + Enums                | 6      |
| Data store                    | 1      |
| Modules                       | 8      |
| Controllers                   | 8      |
| Services                      | 8      |
| DTOs                          | 10     |
| Guards + Decorators           | 2      |
| Filters                       | 1      |
| Utils                         | 3      |
| Config (main.ts, app.module)  | 2      |
| **Total Backend**             | **~49**|

---

## 🧰 NestJS Setup Commands

```bash
# Install NestJS CLI globally
npm install -g @nestjs/cli

# Create the backend in the back-end/ folder
cd back-end
nest new . --skip-git

# Install required packages
npm install @nestjs/swagger swagger-ui-express
npm install class-validator class-transformer
npm install @nestjs/config

# Run development server
npm run start:dev
# Server starts at: http://localhost:3000
# Swagger UI at:    http://localhost:3000/api/docs
```

---

## 📘 Swagger Documentation Requirements

Each API must have:
- `@ApiTags('module-name')` on the controller
- `@ApiOperation({ summary: '...' })` on each route
- `@ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })` on each route
- `@ApiHeader({ name: 'x-user-id', description: 'ID of the caller', required: false })` where applicable
- `@ApiBody({ type: DtoClass })` for POST/PATCH routes
- `@ApiResponse({ status: 200, description: '...', schema: {...} })` for responses
- `@ApiResponse({ status: 403, description: 'Forbidden' })` for guarded routes

---

## Clean Project Structure

```
root/
├── front-end/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── profile.html
│   │
│   ├── super-user/
│   │   ├── dashboard.html
│   │   ├── manage-users.html
│   │   ├── manage-services.html
│   │   ├── workflow-config.html
│   │   ├── officer-onboarding.html
│   │   ├── audit-logs.html
│   │   └── system-settings.html
│   │
│   ├── citizen/
│   │   ├── citizen-dashboard.html
│   │   ├── my-applications.html
│   │   ├── track-application.html
│   │   ├── apply-service.html
│   │   ├── raise-grievance.html
│   │   └── my-grievances.html
│   │
│   ├── officer/
│   │   ├── officer-dashboard.html
│   │   └── review-application.html
│   │
│   ├── supervisor/
│   │   ├── supervisor-dashboard.html
│   │   ├── escalated-cases.html
│   │   ├── supervisor-review.html
│   │   └── workload-management.html
│   │
│   ├── grievance/
│   │   ├── grievance-dashboard.html
│   │   ├── grievance-detail.html
│   │   └── grievance-history.html
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── auth.css
│   │   ├── dashboard.css
│   │   ├── forms.css
│   │   └── landing.css
│   │
│   ├── js/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── state.js
│   │   ├── navigation.js
│   │   ├── role-manager.js
│   │   ├── application.js
│   │   ├── grievance.js
│   │   ├── dashboard.js
│   │   ├── escalation.js
│   │   ├── workflow.js
│   │   ├── notifications.js
│   │   └── utils.js
│   │
│   └── assets/
│       ├── images/
│       └── icons/
│
├── back-end/
│   ├── docs/
│   │   └── swagger.json
│   │
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   │
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── application.model.ts
│   │   │   ├── grievance.model.ts
│   │   │   ├── service.model.ts
│   │   │   ├── notification.model.ts
│   │   │   └── enums.ts
│   │   │
│   │   ├── data/
│   │   │   └── store.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   │
│   │   ├── applications/
│   │   │   ├── applications.module.ts
│   │   │   ├── applications.controller.ts
│   │   │   ├── applications.service.ts
│   │   │   └── dto/
│   │   │       ├── create-application.dto.ts
│   │   │       └── update-status.dto.ts
│   │   │
│   │   ├── grievances/
│   │   │   ├── grievances.module.ts
│   │   │   ├── grievances.controller.ts
│   │   │   ├── grievances.service.ts
│   │   │   └── dto/
│   │   │       ├── create-grievance.dto.ts
│   │   │       └── update-grievance.dto.ts
│   │   │
│   │   ├── services/
│   │   │   ├── services.module.ts
│   │   │   ├── services.controller.ts
│   │   │   ├── services.service.ts
│   │   │   └── dto/
│   │   │       └── create-service.dto.ts
│   │   │
│   │   ├── workflow/
│   │   │   ├── workflow.module.ts
│   │   │   ├── workflow.controller.ts
│   │   │   ├── workflow.service.ts
│   │   │   └── dto/
│   │   │       └── transition.dto.ts
│   │   │
│   │   ├── supervisor/
│   │   │   ├── supervisor.module.ts
│   │   │   ├── supervisor.controller.ts
│   │   │   └── supervisor.service.ts
│   │   │
│   │   ├── super-user/
│   │   │   ├── super-user.module.ts
│   │   │   ├── super-user.controller.ts
│   │   │   └── super-user.service.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   └── notifications.service.ts
│   │   │
│   │   ├── guards/
│   │   │   ├── roles.guard.ts
│   │   │   └── roles.decorator.ts
│   │   │
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   │
│   │   └── utils/
│   │       ├── helpers.ts
│   │       ├── aadhaar.util.ts
│   │       └── pagination.util.ts
│   │
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── Videos/
│   └── demo.mp4
│
└── README.md
```
