# ⚛️ DigiConnect — React Front-End Application
> **Modern Single Page Application (SPA) for the Unified Citizen Service Delivery Platform**  
> *Built with React 19, Vite, React Router v7, and a Custom Clean CSS Design System.*

---

## 🌟 Overview

The `front-end-react` application is the primary citizen and official-facing client for **DigiConnect**. It provides responsive, accessible, and high-performance interfaces tailored for all 7 platform roles (Citizens, Verification Officers, Supervisors, Grievance Officers, Department Heads, State Admins, and Central Admins).

Designed to meet rigorous public sector UX standards, it replaces complex government web portals with a streamlined, mobile-friendly experience featuring real-time status tracking, instant form validations, dynamic SLA indicators, and dedicated statutory compliance hubs.

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Core Framework** | [React 19](https://react.dev/) | Component architecture, fast concurrent rendering, and fine-grained state management. |
| **Build Tooling** | [Vite 8](https://vitejs.dev/) | Lightning-fast Hot Module Replacement (HMR) and optimized production bundles. |
| **Client Routing** | [React Router v7](https://reactrouter.com/) | Declarative nested routing, role-based route guarding, and smooth navigation. |
| **Icons** | [Lucide React](https://lucide.dev/) | Crisp, modern, accessible SVG iconography. |
| **Styling & Theme** | Vanilla CSS Design System | Zero heavy CSS frameworks (no Tailwind or Bootstrap bloat). Lightweight custom CSS tokens in `src/styles/`. |
| **HTTP Client** | [Axios](https://axios-http.com/) | Centralized interceptors propagating identity headers (`x-role`, `x-user-id`) and uniform error handling. |

---

## 🎨 Unified Design System Architecture

All component styling is organized into **5 core stylesheets** under `src/styles/` to maintain strict design consistency without CSS sprawl:

```text
src/styles/
├── style.css       # Core design tokens, CSS variables, typography, buttons, badges, tables, alerts & modals
├── landing.css     # Hero showcase, live application stream previews, feature grids, service tiles, CTA banners
├── auth.css        # Split-screen branded authentication layouts, step progress bars, security question modals
├── dashboard.css   # Collapsible sidebar layouts, summary stat cards, metric pills, queues & timeline status chips
└── forms.css       # Multi-step wizard containers, payment breakdown tables, document uploaders & validation hints
```

### Color Palette & Design Tokens
- **Navy Palette (`--navy-900` to `--navy-50`)**: Authoritative, trustworthy institutional government tones.
- **Accent Gold (`--amber-500`)**: Highlight elements, primary calls-to-action, and SLA warnings.
- **Success Green (`--green-600`)**: Approved applications, verified credentials, and active services.
- **Danger Red (`--red-500`)**: SLA breach alerts, rejected applications, and critical escalations.
- **Typography**: Responsive typography scale with system fallbacks ensuring instant load times.

---

## 🚀 Key Functional Modules & Pages

### 1. Public Portal & Legal Compliance
- **Landing Page (`LandingPage.jsx`)**:
  - Live animated preview stream of recent applications with real-time status tags (`Approved`, `In Review`, `Issued`).
  - Real-time SLA Compliance indicator (96.4% on-time resolution).
  - Categorized service tiles linking to application initiation.
  - 24/7 Citizen Toll-Free Helpline: **`1800-425-0042`**.
- **Statutory Terms of Service (`TermsOfServicePage.jsx`)**:
  - Full legal framework, service delivery standards, fee structures, and citizen rights.
- **Citizen Privacy Policy (`PrivacyPolicyPage.jsx`)**:
  - Aligned with the **Digital Personal Data Protection (DPDP) Act, 2023** and UIDAI guidelines.
  - Transparent documentation of purpose limitation, data retention, and Data Protection Officer contacts.

### 2. Authentication & Onboarding
- **Multi-Role Login (`LoginPage.jsx`)**:
  - Multi-identifier login: Phone number, Aadhaar number, or official email address.
  - **Quick Demo Credentials Bar**: Instant 1-click credential auto-fill for all 8 system roles.
  - Multi-step security question password recovery modal.
- **Citizen Registration (`RegisterPage.jsx`)**:
  - 4-step progressive wizard: (1) Basic Identity & Aadhaar, (2) Jurisdiction Selection (State, District, Mandal, Village/Ward), (3) Credential Creation, (4) OTP Verification.
  - Dynamic loading of existing jurisdiction records directly from the backend seeder.

### 3. Citizen Experience
- **Citizen Dashboard (`CitizenDashboard.jsx`)**: Summary metrics, recent submissions, actionable query notifications.
- **Service Application Wizard (`ApplyServicePage.jsx`)**:
  - Multi-step form with dynamic requirements loading based on chosen service.
  - Fee calculator with auto-computed processing charges and GST.
  - File uploaders with drag-and-drop support.
- **Application Tracking (`TrackApplicationPage.jsx`)**: Visual step-by-step audit timeline showing current stage, officer notes, and estimated SLA resolution date.
- **Grievance Redressal (`RaiseGrievanceModal.jsx`)**: Submit complaints linked to specific application IDs with severity classification.

### 4. Officer & Supervisor Verification
- **Officer Verification Dashboard (`OfficerDashboard.jsx` & `ReviewApplicationPage.jsx`)**:
  - Queue filtering by jurisdiction and status.
  - Document viewer with zoom and verification checkboxes.
  - Clarification query dialog that **pauses the statutory SLA timer**.
  - Draft recommendation builder (Approve / Reject with statutory remarks).
- **Supervisor Overrides & Reassignment (`SupervisorDashboard.jsx`)**:
  - SLA breach warnings and overdue queue monitors.
  - Workload rebalancing tool to reallocate pending files between officers.
  - Final legal digital approval and certificate generation.

### 5. Grievance Management
- **Grievance Redressal Desk (`GrievanceDashboard.jsx`, `GrievanceQueueTable.jsx`, `GrievanceDetailPage.jsx`)**:
  - Independent investigative queue sorted by severity (*Standard*, *Urgent*, *Emergency 24-hr*).
  - Citizen inquiry history and hearing notes timeline.
  - Resolution reports and direct supervisor escalations.

### 6. Notifications & Profile
- **Notification Drawer (`NotificationDrawer.jsx`, `NotificationBell.jsx`)**: Unread counter badge, real-time alerts for status transitions, and mark-as-read actions.
- **Citizen / Officer Profile (`ProfilePage.jsx`)**: Dynamic profile binding, session jurisdiction details, and Aadhaar privacy masking (`•••• •••• ${last4}`).

---

## 📂 Source Code Structure

```text
front-end-react/src/
├── api/                         # Backend REST API Integration
│   ├── apiClient.js             # Axios base instance with interceptors for x-role & x-user-id
│   ├── authApi.js               # Login, registration, profile fetch, password reset
│   ├── applicationApi.js        # Submissions, reviews, query responses, timelines
│   ├── serviceApi.js            # Services master catalog & requirements
│   ├── grievanceApi.js          # Grievance submission, investigation, and resolution
│   ├── notificationApi.js       # User notifications & read markers
│   ├── jurisdictionApi.js       # Administrative hierarchy nodes (State to Village)
│   └── auditApi.js              # Platform activity log queries
│
├── components/                  # Reusable UI Components
│   ├── common/                  # Navbar, Footer, Notifications, Toast Alerts
│   └── grievance/               # GrievanceQueueTable, GrievanceFilters, RaiseGrievanceModal
│
├── context/                     # Global State Contexts
│   └── AuthContext.jsx          # User session, role state, login/logout synchronization
│
├── pages/                       # Application Views
│   ├── public/                  # LandingPage, LoginPage, RegisterPage, Terms, Privacy
│   ├── citizen/                 # CitizenDashboard, ApplyServicePage, TrackApplicationPage
│   ├── officer/                 # OfficerDashboard, ReviewApplicationPage
│   ├── supervisor/              # SupervisorDashboard, Overrides
│   ├── grievance/               # GrievanceDashboard, GrievanceDetailPage
│   ├── admin/                   # StateAdminDashboard, CentralAdminDashboard
│   └── common/                  # ProfilePage
│
├── styles/                      # 5 Unified CSS Design System Files
│   ├── style.css
│   ├── landing.css
│   ├── auth.css
│   ├── dashboard.css
│   └── forms.css
│
├── App.jsx                      # Route definitions, route guarding & layouts
└── main.jsx                     # Application entry point with BrowserRouter & AuthProvider
```

---

## 🚀 Running the Frontend Locally

### Prerequisites
- Node.js v18.x or v20.x
- DigiConnect Backend running at `http://localhost:3000`

### 1. Installation
```bash
cd front-end-react
npm install
```

### 2. Development Server
Start the Vite development server with hot-reload:
```bash
npm run dev
```
Open your browser at **`http://localhost:5173`**.

### 3. Production Build & Verification
Compile and validate production assets:
```bash
npm run build
```
Preview the production bundle locally:
```bash
npm run preview
```

---

## 🔑 Demo Credentials for Testing

Use the quick-fill buttons on the login page or enter these directly with password **`password123`**:

| Role | Email / ID | Jurisdiction / Office |
| :--- | :--- | :--- |
| **Citizen** | `ravi.ap@gmail.com` | Tirupati Rural, AP |
| **Officer (VRO)** | `suresh.vro@ap.gov.in` | Chandragiri Village Office |
| **Officer (RI)** | `jagadeesh.ri@ap.gov.in` | Revenue Inspectorate |
| **Supervisor (MRO)** | `prabhakar.tah@ap.gov.in` | Mandal Revenue Office |
| **Dept Head** | `head.rev@ap.gov.in` | Revenue Secretariat |
| **State Admin** | `admin@ap.gov.in` | AP State Data Centre |
| **Central Admin** | `superuser@gov.in` | Ministry of Electronics & IT |
| **Grievance Officer** | `hemalatha.grv@ap.gov.in` | District Public Grievance Cell |
