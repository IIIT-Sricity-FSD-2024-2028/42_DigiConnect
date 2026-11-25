# ⚛️ DigiConnect — React 19 & Redux Toolkit Front-End Application
> **Modern Single Page Application (SPA) for the Unified Citizen Service Delivery Platform**  
> *Built with React 19, Redux Toolkit (RTK), Vite 8, React Router v7, and a Custom Clean CSS Design System.*

---

## 🌟 Overview

The `front-end` application is the primary citizen and official-facing client for **DigiConnect**. It provides responsive, accessible, and high-performance interfaces tailored for all 7 platform roles (Citizens, Verification Officers, Supervisors, Grievance Officers, Department Heads, State Admins, and Central Admins).

Built on an **Actor-Based Redux Architecture**, it enforces centralized single-source-of-truth state management, strict Service Level Agreement (SLA) countdown tracking, dynamic multi-step form validations, hierarchical jurisdiction routing, and role-based statutory compliance.

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Core Framework** | [React 19](https://react.dev/) | Concurrent rendering, modern hooks, and optimized component lifecycles. |
| **State Management** | [Redux Toolkit (RTK) 2.x](https://redux-toolkit.js.org/) + [React-Redux 9.x](https://react-redux.js.org/) | Centralized actor-based state slices, async thunks with `createAsyncThunk`, and immutable updates via Immer. |
| **Build Tooling** | [Vite 8](https://vitejs.dev/) | Sub-second Hot Module Replacement (HMR) and optimized production bundles. |
| **Client Routing** | [React Router v7](https://reactrouter.com/) | Declarative nested routing, role-based route protection, and dynamic parameter resolution. |
| **Styling & Theme** | Vanilla CSS Design System | Zero heavy CSS framework bloat (no Tailwind or Bootstrap runtime overhead). Modular tokens in `src/styles/`. |
| **HTTP Client** | Native `apiFetch` (`src/api/client.js`) | Lightweight `fetch` wrapper automatically appending governance headers (`x-role`, `x-user-id`, `x-state-id`, `x-department-id`, `x-assigned-node-id`). |
| **Code Quality** | [oxlint](https://oxc.rs/) | Blazing-fast static linting and syntax validation. |

---

## 🏛️ Actor-Based Redux Architecture

The application adopts an **Actor-Based Redux Toolkit Architecture** where each administrative domain operates through its own dedicated slice. Redux serves as the **single source of truth** for all displayed application data.

```
                               ┌───────────────────────────────────┐
                               │     Root Store (store/index.js)   │
                               └─────────────────┬─────────────────┘
                                                 │
         ┌───────────────┬───────────────┬───────┴───────┬───────────────┬───────────────┐
         ▼               ▼               ▼               ▼               ▼               ▼
   [authSlice]    [citizenSlice]  [officerSlice]  [deptHeadSlice] [stateAdminSlice] [centralAdminSlice]
         │               │               │               │               │               │
         ▼               ▼               ▼               ▼               ▼               ▼
  [grievanceSlice][notificationSlice][uiSlice]   ─── Hooks: useAppDispatch / useAppSelector
```

### 1. Dedicated Domain Slices (`src/store/slices/`)
- **`authSlice.js`**: User session lifecycle, role normalization (`citizen`, `officer`, `department_head`, `state_admin`, `central_admin`, `grievance`), persistent storage sync (`localStorage`), OTP verification, and account deactivation / suspension guards.
- **`citizenSlice.js`**: Dynamic service application wizard, multi-step form draft saves, applicant vs. citizen profile separation, payment transaction simulation, and real-time audit tracking timelines.
- **`officerSlice.js`**: Verification work queue, document scrutiny carousel, SLA risk filters, clarification queries (with automatic SLA timer pause), and approval / rejection recommendations.
- **`deptHeadSlice.js`**: Department service catalog management, dynamic form schema builder (custom fields, steps, validation rules), fee configuration, designation masters, officer roster assignments, and departmental revenue metrics.
- **`stateAdminSlice.js`**: State executive dashboard KPIs, department onboarding, appointing IAS Department Heads, operational status toggles (`ACTIVE` ⟷ `SUSPENDED`), recursive 6-tier jurisdiction tree CRUD, and department grievance cell configurations.
- **`centralAdminSlice.js`**: National cross-state performance analytics, state onboarding, state admin credential management, and national revenue breakdowns.
- **`grievanceSlice.js`**: Independent dispute triage, category-based eligibility validation engine, hearing notes, investigation attachments, and multi-tier resolution workflows.
- **`notificationSlice.js`**: Backend-synchronized application notifications, unread count badge counter, mark-as-read, and mark-all-as-read operations.
- **`uiSlice.js`**: Ephemeral UI presentation state: global toast notifications (`showToast`, `hideToast`), responsive mobile sidebar toggle (`openSidebar`, `closeSidebar`, `toggleSidebar`), and modal dialogs.

### 2. Thunk & CRUD Patterns
- **Strict Flow**: `UI ➔ Dispatch Async Thunk ➔ api/*.js ➔ Backend DB ➔ Success Response ➔ Reducer Mutates Redux State ➔ UI Re-renders`.
- **Backend Verification**: State is updated **only after** receiving a positive confirmation from the server.
- **Separation of Concerns**: Temporary UI notifications (toasts) live in `uiSlice.js`, while persistent application records live in their respective domain slices.

---

## 🎨 Unified Design System Architecture

All component styling is organized into **5 core stylesheets** under `src/styles/` to maintain strict design consistency without CSS sprawl:

```text
src/styles/
├── style.css       # Core design tokens, CSS variables, typography, buttons, badges, tables, alerts & modal dialogs
├── landing.css     # Hero showcase, live application stream previews, feature grids, service tiles, CTA banners
├── auth.css        # Split-screen branded authentication layouts, step progress bars, security question modals
├── dashboard.css   # Responsive layout, collapsible sidebar, summary stat cards, metric pills, queues & timeline status chips
└── forms.css       # Multi-step wizard containers, payment breakdown tables, document uploaders & validation hints
```

### Color Palette & Design Tokens
- **Navy Palette (`--navy-900` to `--navy-50`)**: Authoritative, trustworthy institutional government tones.
- **Accent Amber (`--amber-500`)**: Highlight elements, primary calls-to-action, and SLA warning states.
- **Success Green (`--green-600`)**: Approved applications, verified credentials, and active services.
- **Danger Red (`--red-500`)**: SLA breach alerts, rejected applications, and critical escalations.
- **Typography**: Responsive typography scale with system fallbacks ensuring instant load times.

---

## 🚀 Key Functional Modules & Pages

### 1. Public Portal & Legal Compliance
- **Landing Page (`LandingPage.jsx`)**: Live animated stream of public service requests, real-time SLA compliance ticker (96.4% on-time resolution), service catalog shortcuts, and toll-free helpline (`1800-425-0042`).
- **Statutory Terms of Service (`TermsOfServicePage.jsx`)**: Statutory public service delivery standards, fee structures, and citizen rights under Citizen Charters.
- **Citizen Privacy Charter (`PrivacyPolicyPage.jsx`)**: Formulated under the **Digital Personal Data Protection (DPDP) Act, 2023** and UIDAI guidelines, covering Aadhaar data masking and purpose limitation.

### 2. Authentication & Onboarding
- **Multi-Role Login (`LoginPage.jsx`)**: Single-window login supporting Phone number, Aadhaar number, or official email address, with 1-click Quick Demo Credentials bar for all 8 system roles.
- **Citizen Registration (`RegisterPage.jsx`)**: 4-step progressive wizard with dynamic jurisdiction tree selection (State, District, Mandal, Village/Ward) and simulated OTP verification.

### 3. Citizen Experience Portal (`/citizen`)
- **Dashboard (`CitizenDashboard.jsx`)**: Overview KPIs, recent submissions, and actionable query notifications.
- **Service Application Wizard (`ApplyServicePage.jsx`)**: Multi-step dynamic form generator with document drag-and-drop upload and fee breakdown.
- **My Applications (`MyApplicationsPage.jsx`)**: Tabbed list of citizen applications with live status badges.
- **Application Tracking (`TrackApplicationPage.jsx`)**: Visual step-by-step audit timeline showing current processing tier, officer remarks, query responses, and digital certificate downloads.
- **Grievance Redressal (`RaiseGrievancePage.jsx`, `MyGrievancesPage.jsx`)**: Category eligibility-checked complaint filing linked to application IDs.

### 4. Field Verification & Supervisor Portals (`/officer`)
- **Officer Dashboard (`OfficerDashboard.jsx`)**: Verification work queue filtered by jurisdiction and service type, weekly performance metrics, and urgent SLA breach countdowns.
- **Review Application (`ReviewApplicationPage.jsx`)**: Split-screen verification workstation with document viewer, statutory checklist, query trigger (pauses SLA clock), and approval / rejection recommendation builder.

### 5. Department Head Administration (`/department-head`)
- **Department Overview (`DeptDashboard.jsx`)**: Throughput stats, officer leaderboard, and SLA compliance rates.
- **Dynamic Service Builder (`ServiceBuilderPage.jsx`)**: No-code service definition tool for custom form fields, multi-stage approval workflows, and fee structures.
- **Services Catalog (`ServicesCatalogPage.jsx`)**: Manage departmental services and publication status.
- **Officer Roster (`OfficersManagementPage.jsx`, `DesignationsPage.jsx`)**: Manage official designations and assign officers to specific jurisdiction nodes.
- **Revenue Analytics (`RevenuePage.jsx`)**: Track application fee collections and treasury receipts.

### 6. State Administration Portal (`/state-admin`)
- **State Executive Dashboard (`StateDashboard.jsx`)**: High-level state performance KPIs, departmental breakdown, and jurisdiction statistics.
- **Departments Management (`DepartmentsManagementPage.jsx`)**: Onboard state departments, appoint IAS Department Heads, and toggle operational status (`ACTIVE` ⟷ `SUSPENDED`).
- **Dynamic Jurisdictions Tree (`JurisdictionsPage.jsx`, `JurisdictionTreeNode.jsx`)**: Interactive recursive 6-tier administrative boundary tree (State → District → Sub-Division → Mandal/Municipality → Village/Ward) with real-time child addition and boundary renaming.
- **Department Grievance Cells (`DepartmentGrievanceCellsPage.jsx`)**: Configure department-specific grievance redressal cells and statutory resolution SLAs.

### 7. Central / National Administration (`/central-admin`)
- **National Executive Dashboard (`CentralDashboard.jsx`)**: Cross-state performance indices, national service volume, and system health.
- **Manage States (`ManageStatesPage.jsx`, `StateDetailPage.jsx`)**: State government lifecycle, state status toggling, and Chief Secretary credential management.
- **National Analytics (`ApplicationAnalyticsPage.jsx`, `RevenueAnalysisPage.jsx`)**: Cross-state comparative trends, department throughput, and consolidated treasury collections.

### 8. Grievance Redressal Desk (`/grievance`)
- **Grievance Dashboard (`GrievanceDashboard.jsx`, `GrievanceHistoryPage.jsx`)**: Triage inbox sorted by severity (*Standard*, *Urgent*, *Emergency 24-hr*).
- **Grievance Investigation (`GrievanceDetailPage.jsx`)**: 4-step structured investigation: (1) Overview, (2) Investigation & Hearing Notes, (3) Remedial Directives, (4) Case Closure / Supervisor Escalation.

### 9. Shared Navigation & Shell
- **Topbar (`Topbar.jsx`)**: Integrated with `notificationSlice` for real-time notification bell dropdown, unread counter badge, and responsive sidebar toggling.
- **Profile (`ProfilePage.jsx`)**: Profile inspection with Aadhaar masking (`•••• •••• ${last4}`).

---

## 📂 Source Code Structure

```text
front-end/src/
├── api/                         # Native fetch API clients with governance headers
│   ├── client.js                # Centralized apiFetch with x-role, x-user-id headers
│   ├── authApi.js               # Login, registration, profile, password reset
│   ├── citizenApi.js            # Applications, services, tracking
│   ├── officerApi.js            # Verification queues, reviews, queries, decisions
│   ├── departmentHeadApi.js     # Service builder, designations, rosters, revenue
│   ├── stateAdminApi.js         # State dashboard, departments, jurisdictions, cells
│   ├── centralAdminApi.js       # National analytics, state management
│   ├── grievanceApi.js          # Grievance triage, investigation, resolution
│   ├── notificationApi.js       # Notifications fetch, unread counts, mark-as-read
│   └── nationalAnalyticsService.js # Simulated national comparative analytics
│
├── store/                       # Centralized Redux Toolkit Architecture
│   ├── index.js                 # configureStore registering all 9 actor slices
│   ├── hooks.js                 # useAppDispatch and useAppSelector
│   └── slices/
│       ├── authSlice.js         # Authentication, roles, session persistence
│       ├── citizenSlice.js      # Citizen applications, wizard, tracking
│       ├── officerSlice.js      # Officer queue, review, carousel, decisions
│       ├── deptHeadSlice.js     # Department catalog, service builder, designations
│       ├── stateAdminSlice.js   # State KPIs, departments, geography tree, cells
│       ├── centralAdminSlice.js # National dashboard, states management, analytics
│       ├── grievanceSlice.js    # Grievance desk, investigation, resolution
│       ├── notificationSlice.js # Real-time notifications and unread badge
│       └── uiSlice.js           # Ephemeral UI toasts, sidebar drawer, modal state
│
├── components/                  # Reusable UI Components
│   ├── layout/                  # DashboardLayout, Sidebar, Topbar, ProtectedRoute
│   ├── common/                  # Modal, StatCard, StatusBadge, Toast, SearchBar, Charts
│   ├── citizen/                 # DynamicField, FormStepper, ServiceCard, FileUploadDropzone
│   ├── officer/                 # DecisionModal, OfficerQueueTable, OfficerQueueRow
│   ├── department-head/         # ServiceBuilderForm
│   ├── state-admin/             # JurisdictionTreeNode (recursive tree)
│   ├── central-admin/           # CreateStateModal, StatesTable
│   └── grievance/               # GrievanceQueueTable, GrievanceTimeline
│
├── context/                     # Context Providers
│   └── AuthContext.jsx          # User session, role state & auth synchronization
│
├── pages/                       # Application Views by Domain Role
│   ├── public/                  # Landing, Login, Register, Terms, Privacy
│   ├── citizen/                 # CitizenDashboard, ApplyService, MyApplications, Track, Grievance
│   ├── officer/                 # OfficerDashboard, ReviewApplication
│   ├── department-head/         # DeptDashboard, ServicesCatalog, ServiceBuilder, Officers, Revenue
│   ├── state-admin/             # StateDashboard, DepartmentsManagement, Jurisdictions, GrievanceCells
│   ├── central-admin/           # CentralDashboard, ManageStates, StateDetail, Analytics, Revenue
│   ├── grievance/               # GrievanceDashboard, GrievanceDetail, GrievanceHistory
│   └── common/                  # ProfilePage
│
├── styles/                      # 5 Unified CSS Design System Files
│   ├── style.css                # Base tokens, variables, buttons, tables, badges
│   ├── landing.css              # Landing page hero, stream, service tiles
│   ├── auth.css                 # Login, register, split-screen auth layouts
│   ├── dashboard.css            # Dashboards, sidebars, topbars, metric cards
│   └── forms.css                # Form steppers, wizards, inputs, checklists
│
├── utils/                       # Utility Helpers
│   ├── applicationMapper.js     # Normalize application data models
│   ├── certificate.js           # Framed digital certificate generator with QR seal
│   ├── documentViewer.js        # Safe document preview modal
│   └── grievanceEligibility.js  # Category eligibility evaluation engine
│
├── App.jsx                      # Route definitions with role-based ProtectedRoute
└── main.jsx                     # Application entry point with Provider & BrowserRouter
```

---

## 🚀 Running the Frontend Locally

### Prerequisites
- **Node.js**: `v18.x` or `v20.x` (LTS recommended)
- **DigiConnect Backend**: Running at `http://localhost:3000`

### 1. Installation
```bash
cd front-end
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Production Build & Lint Verification
```bash
# Validate production bundle
npm run build

# Run high-speed linter
npm run lint

# Preview production build locally
npm run preview
```

---

## 🔑 Quick Demo Credentials (All Roles)

All pre-configured accounts authenticate with password: **`password123`** (or `'GovAdmin@2026'`):

| Role | Email / Username | Designation / Jurisdiction | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Citizen** | `ravi.ap@gmail.com` | Citizen (Tirupati Rural, AP) | Apply for services, track status, download certificates, raise grievances |
| **Officer (L1 - VRO)** | `suresh.vro@ap.gov.in` | Village Revenue Officer (Chandragiri) | Verify applications, inspect documents, raise queries, draft recommendations |
| **Officer (L1 - RI)** | `jagadeesh.ri@ap.gov.in` | Revenue Inspector (Tirupati Sub-Div) | Scrutinize income/community proofs, field inquiries |
| **Supervisor (L2 - MRO)** | `prabhakar.tah@ap.gov.in` | Mandal Revenue Officer / Tahsildar | Statutory approval, digital certificate signing, workload reassignment |
| **Dept Head** | `head.rev@ap.gov.in` | Principal Secretary, Revenue | Dynamic service builder, designation rosters, SLA oversight, revenue |
| **State Admin** | `admin@ap.gov.in` | Chief Secretary (Andhra Pradesh) | Manage 6-tier jurisdiction tree, onboard departments, grievance cells |
| **Central Admin** | `superuser@gov.in` | Central Administrator (MeitY) | National cross-state analytics, state onboarding, platform security audits |
| **Grievance Officer** | `hemalatha.grv@ap.gov.in` | District Grievance Redressal Officer | Independent case investigation, citizen hearings, remedial directives |
