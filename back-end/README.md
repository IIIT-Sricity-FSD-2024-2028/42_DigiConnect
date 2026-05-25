# 🖥️ DigiConnect Backend API Server
> **NestJS Core Engine for the Unified Citizen Service Delivery Platform**

The backend component of **DigiConnect** is powered by a robust, highly modular [NestJS](https://nestjs.com/) REST API server. It manages all core business logic, application state machine flows, user profile states, real-time logging, and notification dispatches.

---

## 🛠️ Technology Stack & Engine Architecture

-   **Backend Framework**: NestJS (Node.js REST framework utilizing TypeScript)
-   **Security & Guarding**: Middleware & Role Guards enforcing header-based identity propagation.
-   **Validation System**: `class-validator` and `class-transformer` parsing incoming DTO models.
-   **API Documentation**: Built-in Swagger/OpenAPI support with customized styling sheets.
-   **Data Persistence Layer**: In-Memory Mock Database Store containing pre-populated entities.

---

## 🗄️ In-Memory Database Store

To guarantee immediate developer onboarding with zero local database installation overhead (PostgreSQL/MongoDB), the backend features a robust centralized **In-Memory Store** located at `src/data/store.ts`.

### Pre-populated Seed Data Entities
The database is fully bootstrapped with extensive mock data representing typical production volumes:
1.  **Users (`MOCK_USERS`)**: Accounts pre-configured across all platform roles (Citizens, Officers, Supervisors, Admins, Grievance Staff).
2.  **Government Services (`MOCK_SERVICES`)**: Default catalogs including *Income Certificates*, *Caste Certificates*, *Event Permissions*, *Scholarship Applications*, and *Record Corrections*.
3.  **Active Applications (`MOCK_APPLICATIONS`)**: Live application workflows showing various timeline stages (Pending, Under Review, Completed, Query Pending).
4.  **Workflow Configurations (`MOCK_WORKFLOW_CONFIG`)**: State-transition settings for each active service containing validation workflows and stage times.

*Note: As long as the server is running, mutations occur directly in this RAM-based store. Restarting the server resets the application back to its default clean seeded state.*

---

## 🔒 Custom Header-Based Authentication & Guarding

To align with modern high-performance microservices, the backend enforces a secure, lightweight **Identity Propagation Pattern** rather than traditional stateful cookies or JWT tokens.

### The Security Mechanism:
*   Incoming client requests must include the following custom HTTP headers:
    *   `x-role`: The role of the executing user (`citizen`, `officer`, `supervisor`, `grievance`, `super_user`).
    *   `x-user-id`: The corresponding unique identifier (`CIT-1001`, `EMP-1001`, etc.).
*   A dedicated global **Roles Guard** (`src/guards/roles.guard.ts`) intercepts and validates these headers before matching routes.
*   Feature endpoints utilize a custom `@Roles()` decorator to declare permission gates, ensuring compile-time safety and declarative authorization checks across controllers.

---

## 🚀 Directory Structure & Modules

The server uses standard NestJS clean architecture design, grouping code bases cleanly into feature domain packages under `src/`:

| Module Directory | Key API Controller Responsibilities |
| :--- | :--- |
| 👤 `users/` | Handles login, registration, CRUD operations for admin, and credentials updates. |
| 📄 `applications/` | Manages submission, timeline auditing, query responses, and status changes. |
| ⚖️ `grievances/` | Submission of grievances, triage, adding investigation replies, and closure logs. |
| 📋 `services/` | Operations on the services catalog (create, edit, draft toggle, and parameters). |
| 🔔 `notifications/` | User inbox updates, push alerts, unread counts, and mark-read statuses. |
| 👔 `supervisor/` | Aggregates supervisor dashboard stats, tracks SLA breaches, reassigns officers. |
| ⚙️ `super-user/` | Platform-wide configurations (SLA times, audit records, onboarding approvals). |
| 🔄 `workflow/` | State-transition machines enforcing legal movement between timeline milestones. |

---

## 🌐 OpenAPI Documentation (Swagger)

DigiConnect auto-generates comprehensive Open API documentation at boot. In addition, it writes a static copy of the OpenAPI spec to `docs/swagger.json` to make it accessible to external tooling.

### Accessing the Interface:
1. Ensure the server is actively running.
2. Open your browser and navigate to: **`http://localhost:3000/api/docs`**
3. The interface features a custom slate theme styled directly using embedded CSS assets inside `main.ts` for clean readability.

---

## 🔧 CLI Commands

### 1. Installation
Install core packages:
```bash
npm install
```

### 2. Running Local Dev Server
```bash
npm run start:dev
```

### 3. Production Build
Compile TypeScript to production JavaScript distribution:
```bash
npm run build
```

### 4. Running Unit & Integration Tests
```bash
# Execute unit tests
npm run test

# Execute end-to-end (e2e) tests
npm run test:e2e

# View code coverage report
npm run test:cov
```
