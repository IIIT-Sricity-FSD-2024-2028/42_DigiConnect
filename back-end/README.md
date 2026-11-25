# 🖥️ DigiConnect — Backend REST API Server
> **Enterprise NestJS Engine for the Unified Citizen Service Delivery Platform**  
> *Powering Dynamic State Machine Workflows, Algorithmic SLA Timers, and Decentralized Jurisdiction Governance.*

---

## 🌟 Overview

The `back-end` server is the core business and governance engine of **DigiConnect**. Engineered with [NestJS 11](https://nestjs.com/) and TypeScript, it encapsulates the complex public administration domain logic required for citizen service delivery.

Key backend responsibilities include:
- Executing deterministic state-machine lifecycles for public applications.
- Tracking statutory Service Level Agreements (SLAs) with algorithmic countdowns, amber warning thresholds, and automatic supervisor escalations.
- Enforcing territorial jurisdiction access controls from State level down to local Village/Ward offices via a dynamic adjacency list tree.
- Providing an independent, auditable grievance redressal workflow with category-based statutory eligibility verification.
- Issuing digitally verifiable certificates with cryptographic hashes and QR seals.
- Maintaining an immutable, tamper-evident audit ledger for every transaction.

---

## 🛠️ Technology Stack & Architectural Patterns

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [NestJS 11](https://nestjs.com/) | Progressive enterprise framework leveraging Dependency Injection, Controllers, Services, Guards, and Pipes. |
| **Language** | [TypeScript 5.7+](https://www.typescriptlang.org/) | Strongly typed models, DTOs, and compile-time contractual safety. |
| **Validation Layer** | `class-validator` & `class-transformer` | Strict incoming payload validation via global `ValidationPipe` with descriptive error feedback. |
| **Documentation** | [Swagger / OpenAPI 3.0](https://swagger.io/) (`@nestjs/swagger 11.3`) | Auto-generated interactive API explorer available at `/api/docs`. |
| **Data Architecture** | In-Memory Database Store (`src/data/store.ts`) | Pre-populated high-volume database simulating real-world production governance data with zero external DB dependencies. |
| **Jurisdiction Engine** | Dynamic Adjacency List Tree (`src/geography/` & `src/data/jurisdiction.data.ts`) | Models a 6-tier administrative tree linking Union, States, Districts, Mandals, and Village Revenue Offices. |
| **Security & Auditing** | Helmet, Throttler, Winston Daily Rotate | HTTP security headers, rate limiting, and structured file/console audit logging. |

---

## 🔒 Security, Authentication & Role-Based Access Control

### 1. Identity Propagation Pattern
DigiConnect implements a lightweight, high-performance identity propagation pattern ideal for microservices and cloud gateways:
- Clients send identification headers with each request:
  - `x-role`: The authenticated user's normalized role (`CITIZEN`, `OFFICER`, `SUPERVISOR`, `GRIEVANCE_OFFICER`, `DEPARTMENT_HEAD`, `STATE_ADMIN`, `CENTRAL_ADMIN`, `SUPER_USER`).
  - `x-user-id`: The user's unique identifier (e.g., `CIT-AP-001`, `EMP-1001`).
  - `x-state-id`: Scoped state jurisdiction node ID (e.g., `state_ap`).
  - `x-department-id`: Scoped department identifier (e.g., `dept_rev_ap`).
  - `x-assigned-node-id`: Leaf or intermediate jurisdiction node ID (e.g., `node_cg_vil`).
- The global **Roles Guard** (`src/guards/roles.guard.ts`) intercepts requests and validates permissions against `@Roles(...)` metadata attached to controller methods.

### 2. Multi-Role Authentication & Access Guards
The `/users/login` endpoint validates credentials against the in-memory user repository:
- Supports multi-identifier login by **Email**, **Phone**, or **Aadhaar Number**.
- Accepts the standard demo password **`password123`** (or `'GovAdmin@2026'`) for seamless testing across all 8 system roles.
- **Account State Verification**: Automatically rejects authentication attempts if the user's state government is marked `INACTIVE` or if the official account is `Suspended`.
- Provides a multi-step password reset mechanism backed by security questions.

---

## 🗄️ In-Memory Data Store & Seed Architecture

The backend operates on a centralized, highly structured in-memory data store (`src/data/store.ts`, `src/data/jurisdiction.data.ts`, and `src/data/bottom-up-seeder.ts`) that initializes automatically upon boot:

1. **Users (`MOCK_USERS` & `SEED_CITIZENS`)**: Pre-configured accounts across all roles and designations (VROs, Revenue Inspectors, Tahsildars/MROs, Department Heads, State Admins, Central Admins, Grievance Officers, Citizens).
2. **Dynamic Government Services (`DYNAMIC_SERVICES`)**: Comprehensive service catalog with customizable form field schemas, document requirements, fee structures, and multi-tier approval workflows:
   - *Community, Nativity & Date of Birth Certificate* (Revenue Dept, SLA: 7 days)
   - *Income Certificate* (Revenue Dept, SLA: 5 days)
   - *Agricultural Land Mutation & Pattadar Passbook* (Revenue Dept, SLA: 30 days)
   - *Gruha Lakshmi Monthly Financial Grant* (Social Welfare, SLA: 15 days)
   - *Municipal Trade License* (Urban Local Bodies, SLA: 14 days)
3. **Active Applications (`MOCK_APPLICATIONS` & `BOTTOM_UP_APPS`)**: Realistic application lifecycles across discrete stages (`Draft`, `Submitted`, `Under Review`, `Query Raised`, `Recommended`, `Approved`, `Rejected`), with applicant names safely decoupled from citizen account names.
4. **Jurisdiction Hierarchy Nodes (`MASTER_JURISDICTION_NODES`)**: Complete 6-tier bottom-up tree modeling real-world territorial administration across Andhra Pradesh, Karnataka, Kerala, and Tamil Nadu.
5. **Grievance Records (`MOCK_GRIEVANCES` & `BOTTOM_UP_GRVS`)**: Citizen complaints with statutory eligibility ratings, hearing records, investigation notes, and resolution actions.
6. **Notifications (`MOCK_NOTIFICATIONS`)**: Targeted alerts dispatched to citizens and officials on status transitions.
7. **Audit Trails (`MOCK_AUDIT_LOGS`)**: Immutable records of every system action with timestamp, actor, and IP address.

*Note: Changes persist in memory while the server runs. Restarting the server resets the store to its clean seeded state.*

---

## 📂 Source Code Structure & Domain Modules

The backend follows NestJS modular architecture, grouping code into domain packages under `src/`:

```text
back-end/src/
├── applications/                # Application Lifecycle & Dynamic Forms
│   ├── applications.controller.ts # REST endpoints for submissions, reviews, queries, approvals
│   ├── applications.service.ts    # State machine engine, SLA calculator, timeline generator
│   └── dto/                       # CreateApplicationDto, QueryDto, UpdateStatusDto
│
├── geography/                   # Territorial Hierarchy & Tree Traversal
│   ├── geography.controller.ts  # Endpoints for tree nodes, child creation, boundary renaming
│   └── geography.service.ts     # Adjacency list tree traversal, ancestor/descendant queries
│
├── central/                     # National / Central System Administration
│   ├── central.controller.ts    # National dashboard metrics, state onboarding, state status toggles
│   └── central.service.ts       # Cross-state comparative analytics and state lifecycle
│
├── state-admin/                 # State-Wide Administration
│   ├── state-admin.controller.ts# State executive KPIs, department onboarding, grievance cells
│   └── state-admin.service.ts   # Department head appointment, status toggles, cell config
│
├── department-head/             # Department Catalog & Officer Roster
│   ├── department-head.controller.ts # Service builder, designations, rosters, revenue metrics
│   └── department-head.service.ts    # Dynamic form schema persistence, officer assignments
│
├── users/                       # Identity, Auth & Profiles
│   ├── users.controller.ts      # Login, registration, profile updates, password recovery
│   ├── users.service.ts         # User lookup, credential validation, demo auth, status checks
│   └── dto/                     # LoginDto, RegisterUserDto, UpdateProfileDto
│
├── services/                    # Government Services Master Catalog
│   ├── services.controller.ts   # Service discovery, requirements, fee schedules
│   └── services.service.ts      # Catalog filtering by state and department
│
├── grievances/                  # Citizen Grievance Redressal
│   ├── grievances.controller.ts # Grievance filing, queue fetching, investigation notes
│   ├── grievances.service.ts    # Triage logic, statutory eligibility engine, hearing notes
│   ├── grievance-eligibility.util.ts # Rules for Delay, Rejection, Misconduct, Technical claims
│   └── dto/                     # CreateGrievanceDto, UpdateGrievanceDto
│
├── certificates/                # Digital Certificate Issuance
│   ├── certificates.controller.ts # Public certificate verification and download
│   └── certificates.service.ts    # Cryptographic hash generator and framed certificate builder
│
├── notifications/               # Real-Time Notifications
│   ├── notifications.controller.ts # Inbox retrieval, unread counts, mark-as-read
│   └── notifications.service.ts    # Notification dispatch and recipient filtering
│
├── workflow/                    # Dynamic Workflow Engine
│   └── workflow.service.ts      # Validates legal stage transitions and role authorizations
│
├── guards/                      # Security Guards
│   ├── roles.guard.ts           # Intercepts x-role and validates against @Roles() decorator
│   └── roles.decorator.ts       # Decorator defining allowed roles per endpoint
│
├── filters/                     # Exception Handling Filters
│   └── http-exception.filter.ts # Uniform error JSON structure with timestamps
│
├── data/                        # In-Memory Storage & Seeders
│   ├── store.ts                 # Main in-memory entity tables
│   ├── bottom-up-seeder.ts      # Multi-tier administrative node generator
│   └── jurisdiction.data.ts     # Master states, departments, designations, nodes
│
├── app.module.ts                # Root application module wiring all domain packages
└── main.ts                      # NestJS bootstrap, Swagger config, CORS, Winston logger
```

---

## ⚡ Core Domain Mechanisms

### 1. Statutory SLA Engine
- Computes remaining business processing days excluding weekends and official holidays.
- Calculates an **Urgency Ratio**: `Remaining Days / Total SLA Allowance`.
  - When the ratio drops below `0.30`, the status changes to **Urgent** (Amber alert).
  - When remaining days reach `0`, the application is flagged as **Breached** (Red alert) and automatically escalated to supervisor queues.
- **Query Clock Pause**: If an officer raises a clarification query to the applicant, the statutory SLA timer is automatically frozen until the citizen uploads the required response.

### 2. State Machine Transition Rules
The `workflow.service.ts` enforces strict legal transition rules:
- `SUBMITTED` → `UNDER_REVIEW` (Field officer picks up application from queue)
- `UNDER_REVIEW` → `QUERY_RAISED` (Clarification requested; SLA paused)
- `QUERY_RAISED` → `UNDER_REVIEW` (Citizen responds with requested proof; SLA resumed)
- `UNDER_REVIEW` → `RECOMMENDED` (Field officer drafts recommendation note)
- `RECOMMENDED` → `APPROVED` or `REJECTED` (Supervisor executes final statutory decision)

### 3. Grievance Statutory Eligibility Engine
Under `grievance-eligibility.util.ts`, citizen complaints are evaluated against objective criteria:
- **Delay Claims**: Eligible only if the related application has breached statutory SLA days without an active query pause.
- **Arbitrary Rejection**: Eligible if rejected without clear statutory reasoning.
- **Misconduct**: Evaluated with hearing logs and officer notes.

---

## 🌐 OpenAPI / Swagger Documentation

DigiConnect auto-generates comprehensive interactive API documentation at boot:

1. Start the server (`npm run start:dev`).
2. Navigate to: **`http://localhost:3000/api/docs`**
3. Explore and test all endpoints interactively with custom headers (`x-user-id`, `x-role`) and pre-filled payloads.

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
The server starts at `http://localhost:3000/api/v1`.

### 3. Production Build
Compile TypeScript to production JavaScript distribution:
```bash
npm run build
```

### 4. Running Tests
The backend contains a full suite of unit and architectural integration tests:
```bash
# Run all unit tests (master architecture + fixes verification)
npm run test

# Run end-to-end (e2e) tests
npm run test:e2e

# Generate test coverage report
npm run test:cov
```
*(All 50 unit and master-architecture tests pass with 100% success rate)*.
