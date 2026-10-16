# 🖥️ DigiConnect — Backend REST API Server
> **Enterprise NestJS Engine for the Unified Citizen Service Delivery Platform**  
> *Powering Dynamic State Machine Workflows, Algorithmic SLA Timers, and Decentralized Jurisdiction Governance.*

---

## 🌟 Overview

The `back-end` server is the core business and governance engine of **DigiConnect**. Engineered with [NestJS](https://nestjs.com/) and TypeScript, it encapsulates the complex public administration domain logic required for citizen service delivery.

Key backend responsibilities include:
- Executing deterministic state-machine lifecycles for public applications.
- Tracking statutory Service Level Agreements (SLAs) with algorithmic countdowns and automatic supervisor escalations.
- Enforcing territorial jurisdiction access controls from State level down to local Village/Ward offices.
- Providing an independent, auditable grievance redressal workflow.
- Maintaining an immutable, tamper-evident audit ledger for every transaction.

---

## 🛠️ Technology Stack & Architectural Patterns

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [NestJS 10](https://nestjs.com/) | Progressive Node.js framework leveraging enterprise architectural patterns (Dependency Injection, Controllers, Services, Guards, Interceptors). |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strongly typed models, DTOs, and compile-time contracts. |
| **Validation Layer** | `class-validator` & `class-transformer` | Strict incoming request validation via global `ValidationPipe` with detailed error reporting. |
| **Documentation** | [Swagger / OpenAPI 3.0](https://swagger.io/) | Auto-generated interactive API explorer available at `/api/docs`. |
| **Data Architecture** | In-Memory Database Store (`src/data/store.ts`) | Pre-populated high-volume database simulating real-world production data with zero external DB setup required. |
| **Jurisdiction Engine** | Bottom-Up Seeder (`src/data/bottom-up-seeder.ts`) | Generates a 6-tier administrative tree linking States, Districts, Mandals, and Village Revenue Offices. |

---

## 🔒 Security, Authentication & Role-Based Access Control

### 1. Identity Propagation Pattern
DigiConnect implements a lightweight, high-performance identity propagation pattern ideal for microservices and cloud gateways:
- Clients send identification headers with each request:
  - `x-role`: The authenticated user's normalized role (`citizen`, `officer`, `supervisor`, `grievance`, `department_head`, `state_admin`, `super_user`).
  - `x-user-id`: The user's unique identifier (e.g., `CIT-1001`, `EMP-1001`).
- The global **Roles Guard** (`src/guards/roles.guard.ts`) intercepts requests and validates permissions against `@Roles(...)` metadata attached to controller methods.

### 2. Multi-Role Demo Authentication
The `/users/login` endpoint validates credentials against the in-memory user repository:
- Supports login by **Email**, **Phone**, or **Aadhaar Number**.
- Accepts the standard demo password **`password123`** (or `'GovAdmin@2026'`) for seamless testing of all 8 system roles.
- Provides a multi-step password reset mechanism backed by security questions.

---

## 🗄️ In-Memory Data Store & Seed Architecture

The backend operates on a centralized, highly structured in-memory data store (`src/data/store.ts` and `src/data/bottom-up-seeder.ts`) that initializes automatically upon boot:

1. **Users (`MOCK_USERS`)**: Pre-configured accounts across all roles and designations (VROs, Revenue Inspectors, Tahsildars/MROs, Grievance Officers, Citizens).
2. **Government Services (`MOCK_SERVICES`)**: Comprehensive service catalog including:
   - *Community & Caste Certificate* (Revenue Dept, SLA: 7 days)
   - *Income Certificate* (Revenue Dept, SLA: 5 days)
   - *Residence Certificate* (Revenue Dept, SLA: 5 days)
   - *Event Permission & Venue Clearance* (Police / Municipal, SLA: 10 days)
   - *Farmer Subsidy & Agricultural Assistance* (Agriculture Dept, SLA: 15 days)
   - *Municipal Trade License* (Urban Local Bodies, SLA: 14 days)
3. **Active Applications (`MOCK_APPLICATIONS`)**: Realistic application lifecycles across diverse stages (`Draft`, `Submitted`, `Under Review`, `Query Raised`, `Recommended`, `Approved`, `Rejected`).
4. **Jurisdiction Hierarchy Nodes (`MOCK_JURISDICTIONS`)**: Hierarchical tree modeling real-world territorial administration (State → District → Sub-Division → Mandal → Village).
5. **Grievance Records (`MOCK_GRIEVANCES`)**: Citizen escalations with severity rankings, inquiry notes, and resolution statuses.
6. **Notifications (`MOCK_NOTIFICATIONS`)**: Targeted alerts dispatched to citizens and officials.
7. **Audit Trails (`MOCK_AUDIT_LOGS`)**: Immutable records of every system event.

*Note: Changes persist in memory while the server runs. Restarting the server resets the store to its clean seeded state.*

---

## 📂 Source Code Structure & Modules

The backend follows NestJS clean architecture, grouping code into focused domain modules under `src/`:

```text
back-end/src/
├── applications/                # Application Lifecycle & Workflow
│   ├── applications.controller.ts # REST endpoints for citizen submissions, reviews, queries
│   ├── applications.service.ts    # State machine engine, SLA calculator, timeline generator
│   └── dto/                       # CreateApplicationDto, QueryDto, UpdateStatusDto
│
├── users/                       # Identity, Auth & Profiles
│   ├── users.controller.ts      # Login, registration, profile updates, password recovery
│   ├── users.service.ts         # User lookup, credential validation, demo auth
│   └── dto/                     # LoginDto, RegisterUserDto, UpdateProfileDto
│
├── services/                    # Government Services Master Catalog
│   ├── services.controller.ts   # Service discovery, requirements, fee schedules
│   ├── services.service.ts      # Catalog management and filtering
│   └── dto/                     # CreateServiceDto, UpdateServiceDto
│
├── grievances/                  # Citizen Grievance Redressal
│   ├── grievances.controller.ts # Grievance filing, queue fetching, investigation notes
│   ├── grievances.service.ts    # Triage logic, SLA compliance, supervisor escalation
│   └── dto/                     # CreateGrievanceDto, ResolveGrievanceDto
│
├── notifications/               # Real-Time Notifications
│   ├── notifications.controller.ts # Inbox retrieval, unread counts, mark-as-read
│   └── notifications.service.ts    # Notification dispatch and recipient filtering
│
├── supervisor/                  # Supervisory Governance & Overrides
│   ├── supervisor.controller.ts # Workload reassignments, SLA breach monitoring, overrides
│   └── supervisor.service.ts    # Aggregated departmental statistics and queue reallocation
│
├── super-user/                  # Central System Administration
│   ├── super-user.controller.ts # Platform-wide settings, user onboarding, global audit logs
│   └── super-user.service.ts    # Configuration state management
│
├── workflow/                    # Dynamic Workflow Engine
│   └── workflow.service.ts      # Validates legal stage transitions (e.g., cannot approve without review)
│
├── jurisdiction/                # Territorial Hierarchy Module
│   └── jurisdiction.service.ts  # Traverses State -> District -> Mandal -> Village tree
│
├── audit/                       # Tamper-Evident System Audit
│   └── audit.service.ts         # Immutable logging of all user and system actions
│
├── guards/                      # Security Guards
│   └── roles.guard.ts           # Intercepts x-role and validates against @Roles() decorator
│
├── data/                        # In-Memory Storage & Seeders
│   ├── store.ts                 # Main in-memory entity tables
│   └── bottom-up-seeder.ts      # Multi-tier administrative node generator
│
├── main.ts                      # NestJS bootstrap, Swagger config, CORS, global validation pipe
└── app.module.ts                # Root application module wiring all domain packages
```

---

## ⚡ Core Domain Mechanisms

### 1. Statutory SLA Engine
- Computes remaining processing days excluding weekends and official holidays.
- Calculates an **Urgency Ratio**: `Remaining Days / Total SLA Allowance`.
  - When the ratio drops below `0.30`, the status changes to **Urgent** (Amber).
  - When remaining days reach `0`, the application is flagged as **Breached** (Red) and escalated.
- **Query Clock Pause**: If an officer raises a query to the citizen, the SLA timer is automatically frozen until the citizen submits the required response.

### 2. State Machine Transition Rules
The `workflow.service.ts` enforces strict legal transition rules:
- `SUBMITTED` → `UNDER_REVIEW` (Officer picks up application)
- `UNDER_REVIEW` → `QUERY_RAISED` (Clarification required from citizen)
- `QUERY_RAISED` → `UNDER_REVIEW` (Citizen responds with documents)
- `UNDER_REVIEW` → `RECOMMENDED` (Officer submits assessment note)
- `RECOMMENDED` → `APPROVED` or `REJECTED` (Supervisor gives final decision)

---

## 🌐 OpenAPI / Swagger Documentation

DigiConnect auto-generates comprehensive interactive API documentation at boot:

1. Start the server (`npm run start:dev`).
2. Navigate to: **`http://localhost:3000/api/docs`**
3. Explore and test all endpoints interactively with custom headers and pre-filled payloads.
4. Static OpenAPI JSON specification is exported to `docs/swagger.json`.

---

## 🔧 CLI Commands

### 1. Installation
```bash
npm install
```

### 2. Run Development Server (with hot-reload)
```bash
npm run start:dev
```
The server will start at `http://localhost:3000`.

### 3. Production Build
Compile TypeScript to production JavaScript distribution:
```bash
npm run build
```

### 4. Running Tests
```bash
# Unit tests
npm run test

# End-to-end (e2e) tests
npm run test:e2e

# Code coverage report
npm run test:cov
```
