# 🏛️ DigiConnect — Digital Governance & E-Services Platform
> **Unified Citizen Service Delivery Platform (UCSDP)**  
> *Transforming Public Administration with Automated Workflows, Algorithmic SLA Guarantees, and Decentralized Jurisdiction Governance.*

---

## 📖 Executive Summary & Domain Overview

**DigiConnect** is an enterprise-grade digital governance and public administration platform designed to modernize and unify citizen service delivery. Inspired by successful national e-governance initiatives (such as *Digital India*, *MeeSeva*, *Seva Sindhu*, and *e-District*), DigiConnect replaces bureaucratic bottlenecks, physical paperwork, and fragmented departmental silos with a unified, transparent, and legally accountable digital ecosystem.

Public service delivery in modern states requires coordinating complex administrative hierarchies, statutory timelines, multi-step field verification, fee collection, and independent grievance redressal. DigiConnect establishes an automated end-to-end framework where citizens access government services from anywhere, while departmental officials execute verifications within strictly tracked statutory time limits (Service Level Agreements - SLAs).

---

## 🏛️ Public Administration & Jurisdiction Domain Model

### 1. The 6-Tier Bottom-Up Administrative Hierarchy
Government administration in federal democracies operates on territorial jurisdictions. DigiConnect implements a hierarchical bottom-up tree structure enabling localized service routing:

```
               ┌───────────────────────────────┐
               │    Tier 1: Central / Union    │
               └──────────────┬────────────────┘
                              ▼
               ┌───────────────────────────────┐
               │        Tier 2: State          │
               │  (e.g., Andhra Pradesh, etc.) │
               └──────────────┬────────────────┘
                              ▼
               ┌───────────────────────────────┐
               │    Tier 3: Zone / Division    │
               └──────────────┬────────────────┘
                              ▼
               ┌───────────────────────────────┐
               │       Tier 4: District        │
               │(e.g., Tirupati, Chittoor, etc)│
               └──────────────┬────────────────┘
                              ▼
               ┌───────────────────────────────┐
               │ Tier 5: Sub-Division / Mandal │
               │ (e.g., Chandragiri, Urban)    │
               └──────────────┬────────────────┘
                              ▼
               ┌───────────────────────────────┐
               │ Tier 6: Village / Ward / GP   │
               │ (Gram Panchayat / Ward Office)│
               └───────────────────────────────┘
```

- **Bottom-Up Routing**: A citizen applying for a Community or Residence Certificate selects their local village/ward. The application is automatically routed to the designated Village Revenue Officer (VRO) assigned to that specific jurisdiction node.
- **Jurisdiction Inheritance**: Higher-tier officers (Mandal Revenue Officers, District Revenue Officers, District Collectors) have scoped oversight over all child nodes within their administrative boundary.

### 2. Departmental Organization
Services belong to statutory government departments:
- **Revenue & Land Records**: Community Certificates, Residence Proofs, Income Certificates, Land Mutation.
- **Municipal Administration & Urban Development**: Building Permissions, Trade Licenses, Water Tap Connections.
- **Social Welfare**: Scholarships, Pensions, Subsidies for Underprivileged Communities.
- **Civil Supplies**: Ration Cards, Fair Price Shop Registrations.
- **Civil Registration**: Birth & Death Registrations.

---

## 👥 Core Domain Actors & Role Matrix

DigiConnect strictly segregates duties to maintain institutional checks and balances across 7 defined user roles:

| Role | Key Domain Responsibility | Scope & Authority |
| :--- | :--- | :--- |
| **Citizen** | Beneficiary of public services | Discover services, submit applications, upload verified documents, track live status, pay fees, receive certified documents, raise grievances. |
| **Department Officer (L1)** | Operational verification official (e.g., VRO, RI) | Review assigned queue for their jurisdiction, verify uploaded documents, trigger field inspections, raise clarification queries, draft approval/rejection recommendations. |
| **Department Supervisor (L2)** | Statutory sanctioning authority (e.g., MRO, Tahsildar) | Review officer recommendations, monitor SLA compliance, perform workload reassignments, execute supervisor overrides, issue final digital certificates. |
| **Grievance Officer** | Independent dispute & redressal authority | Triage citizen complaints, investigate delays or arbitrary rejections, issue inquiry reports, escalate unresolved cases to higher supervisors. |
| **Department Head** | Department-level administrative controller | Configure departmental service catalogs, define SLA thresholds, assign officers to jurisdiction nodes, audit departmental throughput. |
| **State Admin** | State-wide governance supervisor | Manage state jurisdiction trees, configure multi-department policies, monitor state-wide SLA compliance and grievance resolution metrics. |
| **Central Admin** | System-wide platform administrator | Platform tenant lifecycle, global user authorizations, security parameter configuration, immutable system audit inspection. |

---

## ⚙️ Core Business Engines & Domain Mechanisms

```
+──────────────────────────────────────────────────────────────────────────────+
|                           DIGICONNECT DOMAIN ENGINES                         |
+──────────────────────────────────────────────────────────────────────────────+
|  [Citizen Portal]  ──>  [Jurisdiction Router]  ──>  [Dynamic Workflow Engine] |
|                                                              │               |
|                                                              ▼               |
|  [Notification Hub] <──  [SLA Clock & Escalator] <──  [L1 Review -> L2 Sign] |
|                                                              │               |
|                                                              ▼               |
|  [Citizen Download] <──  [Digital Certificate]   <──  [Approved & Dispatched]|
+──────────────────────────────────────────────────────────────────────────────+
```

### 1. Dynamic State Machine Workflow
Applications transition through discrete, legally bounded lifecycle stages:
1. **Draft / Initiated**: Citizen enters details and uploads required identity/address proofs.
2. **Submitted & Fee Paid**: Timestamped submission, receipt generation, and assignment to jurisdiction queue.
3. **Under Review (L1)**: Officer inspects physical/digital attachments and verifies records.
4. **Query Raised (`Action Required`)**: If documents are blurred or incomplete, the officer raises a query. **The SLA clock automatically pauses** until the citizen uploads clarifications.
5. **Recommended for Approval / Rejection**: L1 Officer submits an assessment note to the L2 Supervisor.
6. **Supervisor Review (L2)**: Supervisor inspects recommendations and verifies statutory compliance.
7. **Approved & Issued / Rejected with Reason**: Certificate issued with digital verification watermark or formal reasoned rejection letter provided to citizen.

### 2. Algorithmic SLA Monitoring & Automatic Escalation
Under Citizen Charters and Right to Public Services legislation, government bodies must process citizen requests within defined statutory days:
- **SLA Countdown Timer**: Real-time business day calculation based on service type (e.g., Income Certificate = 7 days; Trade License = 15 days).
- **Amber Warning Alert**: Triggered when remaining time drops below 30% of statutory allowance.
- **Red Breach & Auto-Escalation**: When an application breaches SLA, it is automatically flagged in supervisor queues with escalated priority and logged in the departmental breach registry.

### 3. Integrated Grievance Redressal Mechanism
An independent appellate channel for citizens aggrieved by service delays, rude behavior, procedural errors, or unjustified rejections:
- **Multi-Level Triage**: Categorized by severity (*Standard*, *Urgent*, *Emergency 24-hr*).
- **Audit Investigation**: Grievance officers review immutable application history and query records before directing remedial action.

### 4. Data Privacy, Aadhaar Masking & DPDP 2023 Compliance
In compliance with the **Digital Personal Data Protection (DPDP) Act, 2023** and UIDAI guidelines:
- **Aadhaar Data Vault Protection**: Aadhaar numbers are never displayed in raw text. Masked format (`•••• •••• 1234` or `XXXX-XXXX-1234`) is strictly enforced in all dashboards.
- **Consent-Driven Processing**: Purpose limitation and explicit consent checkboxes during registration and application submission.
- **Immutable Audit Trails**: Every read, write, update, state transition, and authentication event is logged with actor ID, role, timestamp, and IP reference.

---

## 📂 Repository Structure

DigiConnect is organized as an enterprise monorepo:

```text
42_DigiConnect/
├── front-end-react/             # Production React 19 + Vite SPA (Primary Frontend)
│   ├── src/
│   │   ├── api/                 # Centralized Axios API clients with role headers
│   │   ├── components/          # Reusable UI components (Navbar, Footer, Modals, Grievance Tables)
│   │   ├── context/             # AuthContext (JWT/Session state, dynamic role permissions)
│   │   ├── pages/
│   │   │   ├── public/          # Landing, Login, Register, Terms of Service, Privacy Policy
│   │   │   ├── citizen/         # Citizen Dashboard, Apply Wizard, Track Applications
│   │   │   ├── officer/         # Officer Dashboard, Review Queue, Application Verification
│   │   │   ├── supervisor/      # Supervisor Dashboard, Overrides, Workload Reallocation
│   │   │   ├── grievance/       # Grievance Dashboard, Queue, Details & Investigation
│   │   │   ├── admin/           # Central & State Admin Dashboards, Jurisdiction Trees
│   │   │   └── common/          # Citizen/Official Profile, Notifications Drawer
│   │   └── styles/              # 5 Core Design System CSS Files (Zero external UI bloat)
│   ├── package.json             # React 19, React Router v7, Lucide Icons
│   └── vite.config.js           # Vite development and bundle configuration
│
├── back-end/                    # NestJS Enterprise TypeScript REST API Server
│   ├── src/
│   │   ├── users/               # Authentication, Profiles, Demo Credentials, Password Recovery
│   │   ├── applications/        # Application Lifecycle Engine, Dynamic Forms, SLA Calculations
│   │   ├── services/            # Government Services Catalog, Requirements, Fee Master
│   │   ├── grievances/          # Citizen Complaints, Investigation Notes, SLA Breach Triage
│   │   ├── notifications/       # Multi-Channel Notification Dispatcher & Inbox Manager
│   │   ├── supervisor/          # Supervisory Reassignments, SLA Overdue Escalations
│   │   ├── super-user/          # Platform Settings, Onboarding Approvals, Global Audits
│   │   ├── workflow/            # Dynamic Workflow & State Machine Enforcement
│   │   ├── jurisdiction/        # Bottom-Up Administrative Hierarchy (State to Village)
│   │   ├── audit/               # Immutable System-Wide Activity Log Repository
│   │   └── data/
│   │       ├── store.ts         # In-Memory Database Store with extensive production seed data
│   │       └── bottom-up-seeder.ts # Administrative Jurisdiction Hierarchy Seeder
│   ├── package.json             # NestJS 10, TypeScript 5, class-validator, Swagger
│   └── tsconfig.json            # Strict TypeScript compiler options
│
├── front-end/                   # Reference Vanilla HTML5/CSS3/JS Multi-Role Web Portals
├── Database/                    # Reference Relational Schemas and Seed Configs
├── Figma Designs/               # Original UX/UI Wireframes & Design Assets
├── DomainExpertInteraction.md   # Domain-Specific Context and E-Governance Requirements
├── definitions.yml              # Centralized Service & REST API Specifications
└── SRS.pdf                      # Comprehensive Software Requirements Specification
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.x` or `v20.x` (LTS recommended)
- **NPM**: `v9.x` or `v10.x`

### 1. Start the Backend API Server
```bash
cd back-end
npm install
npm run start:dev
```
- **REST API Base URL**: `http://localhost:3000/api/v1`
- **Interactive Swagger Docs**: `http://localhost:3000/api/docs`

### 2. Start the Modern React Frontend
```bash
cd front-end-react
npm install
npm run dev
```
- **Web Portal Access**: `http://localhost:5173`
- Hot-reload enabled with instant Vite HMR.

---

## 🔑 Quick Demo Credentials (All Roles)

All pre-configured demonstration accounts authenticate with password: **`password123`** (or `'GovAdmin@2026'`):

| Role | Username / Email | Designation / Node | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Citizen** | `ravi.ap@gmail.com` | Citizen (Tirupati, AP) | Apply for services, track status, raise grievances |
| **Officer (L1)** | `suresh.vro@ap.gov.in` | Village Revenue Officer (VRO) | Verification queue, field notes, query applicant |
| **Officer (L1)** | `jagadeesh.ri@ap.gov.in` | Revenue Inspector (RI) | Scrutiny of applicant income & community eligibility |
| **Supervisor (L2)** | `prabhakar.tah@ap.gov.in` | Mandal Revenue Officer (MRO) | Final certificate approval, workload reassignment |
| **Dept Head** | `head.rev@ap.gov.in` | Head of Revenue Department | Service catalog management, departmental SLA oversight |
| **State Admin** | `admin@ap.gov.in` | State Administration (AP) | Jurisdiction tree management, multi-department oversight |
| **Central Admin** | `superuser@gov.in` | Central / Super User | Global system settings, security audits, tenant config |
| **Grievance Officer** | `hemalatha.grv@ap.gov.in` | District Grievance Officer | Complaint investigation, citizen hearing notes, resolution |

---

## ⚖️ Legal, Compliance & Helplines
- **Citizen Helpline**: `1800-425-0042 (Toll Free)` — Available 24/7.
- **Grievance Helpdesk**: `grievance@digiconnect.gov.in`
- **Data Protection Office (DPO)**: `dpo@digiconnect.gov.in`
- **Statutory Terms of Service**: `/terms`
- **Citizen Privacy Charter**: `/privacy`

---

## 📄 License
This project is licensed under the **MIT License**. Created for academic, research, and public administration modernization initiatives at IIIT Sri City.
