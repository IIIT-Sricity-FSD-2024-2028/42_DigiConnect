# 🚀 DigiConnect — Digital Governance and E-Services
> **Unified Citizen Service Delivery Platform (UCSDP)**

DigiConnect is a comprehensive, centralized digital governance and e-services platform designed to streamline and unify citizen service delivery. The application brings together certificate issuance, welfare scheme eligibility, permission approvals, and grievance redressal under a single portal, replacing fragmented legacy government workflows with an automated, transparent, and SLA-monitored system.

---

## 🏛️ Domain Architecture: Actors & Roles

Government operations are highly hierarchical. DigiConnect mimics real-world operations by segregating platform features into five core actors:

### 1. Citizen
A citizen is the ultimate beneficiary of the platform. They submit applications and manage requests.
*   **Apply for Services**: Submit certificate requests, welfare schemes, and license permissions.
*   **Upload Documents**: Digital repository management for Aadhaar card, Ration cards, Income certificates.
*   **Real-time Tracking**: Interactive timelines showing where applications stand.
*   **Query Responses**: Submit clarifications requested by verification officers.
*   **Raise Grievances**: Escalate unresolved issues or arbitrary rejections to the grievance desk.

### 2. Department Officer (First-Level Verification Officer)
Officers evaluate initial requests and make operational recommendations.
*   **Application Queues**: Review assigned citizen requests.
*   **Document Verification**: Inspect uploaded documentation for validity.
*   **Query Citizen**: Request updates or clarifications for incorrect submissions.
*   **Escalate/Recommend**: Draft a recommendation of approval or rejection and pass to supervisors.

### 3. Department Supervisor (Supervisory Authority)
Supervisors provide quality assurance, compliance monitoring, and override permissions.
*   **SLA Compliance**: Monitor pending items and SLA-breached tasks.
*   **Decision Authority**: Approve/Reject applications with final legal signatures.
*   **Workload Reassignment**: Reallocate pending queues from congested officers.
*   **Supervisor Override**: Enforce policy changes and override first-level officer recommendations.

### 4. Grievance Officer
Independent actors dedicated to exception handling, citizen escalations, and dispute resolution.
*   **Grievance Triage**: Categorize and assign severity ratings to citizen complaints.
*   **Audit Investigation**: Inspect past timelines and action histories of applications.
*   **Conflict Resolution**: Enforce compliance and issue remediation reports.

### 5. Super User (System Administrator)
Maintains platform security, services katalog, SLA rules, and tenant configurations.
*   **Onboard Personnel**: Authorize new Department Officers and Supervisors.
*   **Service Configuration**: Edit dynamic SLAs, dynamic workflow configurations, and registration forms.
*   **Security & Audit**: View comprehensive system audit logs to detect security issues or breaches.

---

## ⚙️ Core Business Features

*   **Dynamic State Machine Workflows**: Services transition fluidly across customizable stages (Document Verification -> Field Inspection -> Final Review) using definitions stored in the backend.
*   **SLA Monitoring & Breaches**: Automated SLA clocks compute remaining days for processing based on service limits, visual warning triggers, and immediate routing escalations.
*   **Robust Auditing Trails**: Every single action taken by any actor (login, state transitions, updates, uploads) is logged immutably in a system-wide audit catalog.
*   **Simulated Secure Aadhaar Validations**: Utilities block and mask critical details to maintain data privacy guidelines while verifying citizen details.

---

## 📂 Project Repository Structure

This repository is organized as a unified monorepo containing both the server-side REST API and the client-side portal interfaces.

```text
42_DigiConnect/
├── back-end/                    # NestJS API Server (Business Logic & Data)
│   ├── src/                     # NestJS TypeScript Source Files
│   │   ├── users/               # Authentication & User Management
│   │   ├── applications/        # Service Application Lifecycles
│   │   ├── grievances/          # Grievance Submission & Tracking
│   │   ├── services/            # Government Services Catalog
│   │   ├── notifications/       # User Notifications Subsystem
│   │   ├── supervisor/          # Escalations & Supervisor Overrides
│   │   ├── super-user/          # System Administration & Settings
│   │   ├── workflow/            # Dynamic Workflow Engines
│   │   └── data/store.ts        # Seed Data & In-Memory Database Store
│   └── package.json             # Backend dependencies & script definitions
│
├── front-end/                   # Multi-Role Vanilla HTML/CSS/JS Portals
│   ├── citizen/                 # Citizen Dashboard & Application Wizards
│   ├── officer/                 # Department Officer Review Queues
│   ├── supervisor/              # Supervisor Overload Management
│   ├── grievance/               # Grievance Redressal Dashboards
│   ├── super-user/              # System Configuration & Audit Logs
│   ├── css/                     # Harmonious Styling & Tokens
│   ├── js/                      # Page Scripts & API Handlers (js/api.js)
│   └── index.html               # Main Public Landing Page
│
├── Database/                    # Reference Schemas and Seed Configs
├── Figma Designs/               # Original UX/UI Wireframes & Assets
├── DomainExpertInteraction.md   # Domain-Specific Context and Refinement Notes
├── definitions.yml              # Centralized Service & API Definitions
└── SRS.pdf                      # Software Requirements Specification (Functional Specifications)
```

---

## ⚙️ Technical Architecture Overview

DigiConnect is engineered using a decoupled modern architectural pattern:

```text
  ┌──────────────────────────────────────────────────────────┐
  │                   Front-End Client                       │
  │     (Vanilla HTML5 / CSS3 / ES6 Modules / Tailwind)      │
  └──────────────────────────┬───────────────────────────────┘
                             │ (Centralized AJAX API Layer via js/api.js)
                             ▼
  ┌──────────────────────────────────────────────────────────┐
  │                 NestJS REST API Gateway                  │
  │     (CORS enabled, Global Filter & Validation Pipe)      │
  └──────────────────────────┬───────────────────────────────┘
                             │ (Role Guards: x-role & x-user-id Header Enforced)
                             ▼
  ┌──────────────────────────────────────────────────────────┐
  │               Business Logic Services                    │
  │   (Dynamic Workflow Engine & SLA Compliance Monitors)    │
  └──────────────────────────┬───────────────────────────────┘
                             │
                             ▼
  ┌──────────────────────────────────────────────────────────┐
  │                 In-Memory Data Store                     │
  │      (Pre-seeded entities, fully mocked storage)         │
  └──────────────────────────────────────────────────────────┘
```

---

## 🛠️ Global Quick Start Guide

### Prerequisites
Make sure you have the following installed locally:
- **Node.js** (v18.x or above recommended)
- **NPM** (v9.x or above)

### 1. Boot up the Backend Server
Navigate to the backend directory, install packages, and boot the server in hot-reload mode:
```bash
cd back-end
npm install
npm run start:dev
```
*   **API Base URL**: `http://localhost:3000/api/v1`
*   **Interactive Swagger API Docs**: `http://localhost:3000/api/docs`

### 2. Launch the Frontend Application
Since the frontend is built using standard Vanilla Web components, you can serve the directory statically using any server tool or open files directly.
```bash
cd ../front-end
# Serve static files locally:
npx serve .
```
*   **Web Portal Access**: `http://localhost:3000` (or `http://localhost:5000` depending on the port assigned by `serve`).
*   **Browser Requirements**: Google Chrome, Mozilla Firefox, or Microsoft Edge.
