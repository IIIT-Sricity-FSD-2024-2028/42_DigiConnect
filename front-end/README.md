# 🎨 DigiConnect Front-End Application
> **Vanilla HTML5 / CSS3 / ES6 Client Portal**

The frontend of **DigiConnect** is a fast, responsive, and decoupled multi-page dashboard application. Built entirely on vanilla web standards without bulky heavy framework overhead, it utilizes modular styling, centralized session managers, and a dedicated interface client layer to communicate with the REST API.

---

## 📐 Directory Structure & Portals

The frontend code base is organized into role-specific folders that represent independent portals, coupled with shared utility folders:

```text
front-end/
├── css/                         # Custom Styling Sheets (Sleek UI tokens)
│   ├── style.css                # Global styles, variables, typography, navigation
│   ├── dashboard.css            # Grid layouts, widget cards, metrics tables
│   ├── forms.css                # Multi-step wizards, file upload fields
│   ├── auth.css                 # Login and Registration interface assets
│   └── landing.css              # landing page styles
│
├── js/                          # Logic Modules & Core Helpers
│   ├── api.js                   # ★ Centralized API client (Fetch wrappers)
│   ├── auth.js                  # Login/Register scripts & session hooks
│   ├── navigation.js            # Sidebar drawer renderer, breadcrumbs, initPage()
│   ├── dashboard.js             # Dashboards loaders for all 5 roles
│   ├── application.js           # Multi-step apply forms, review status updates
│   ├── grievance.js             # Grievance registration and history detail logs
│   ├── escalation.js            # Supervisor reassignment & approvals overrides
│   ├── admin.js                 # Super User settings, onboarding & audit logic
│   ├── notifications.js         # Inbox panels, polling loops, mark-read methods
│   └── utils.js                 # Shared tools (Aadhaar masking, formats, toasts)
│
├── citizen/                     # Citizen Portal Pages
│   ├── citizen-dashboard.html   # Service status overview, metrics, inbox
│   ├── apply-service.html       # Dynamic wizard form for certificate submissions
│   ├── my-applications.html     # Application list and detailed timeline logs
│   ├── track-application.html   # Public reference-based application tracker
│   ├── my-grievances.html       # Citizen dispute files and feedback
│   └── raise-grievance.html     # Complaint creation wizard
│
├── officer/                     # Department Verification Officer Pages
│   ├── officer-dashboard.html   # Review queue, priority metrics, filters
│   └── review-application.html  # Document evaluation & query dispatch panel
│
├── supervisor/                  # Department Supervisor Review Pages
│   ├── supervisor-dashboard.html# SLA monitoring dashboard, escalation list
│   ├── supervisor-review.html   # Final override approvals interface
│   ├── escalated-cases.html     # Breached SLAs queue
│   └── workload-management.html # Officer re-assignments grid
│
├── grievance/                   # Grievance Resolution Officer Pages
│   ├── grievance-dashboard.html # Active disputes queue
│   ├── grievance-detail.html    # Full audit investigator & response portal
│   └── grievance-history.html   # Historic resolutions archive
│
├── super-user/                  # System Admin Portal Pages
│   ├── dashboard.html           # Platform usage logs, server telemetry indicators
│   ├── manage-users.html        # System-wide user CRUD utility
│   ├── manage-services.html     # Service catalogue settings & SLA intervals
│   ├── officer-onboarding.html  # Registrations approval panels
│   ├── audit-logs.html          # Unaltered chronological action logs viewer
│   ├── system-settings.html     # Feature toggles, SLA clocks calibration
│   └── workflow-config.html     # Dynamic state machine visualizer
│
├── index.html                   # Main Landing Page
├── login.html                   # Universal login gateway
├── register.html                # Citizen account registration page
└── profile.html                 # Shared user profile management page
```

---

## ⚡ Centralized API Layer (`js/api.js`)

All AJAX network requests to the NestJS backend are routed through a single source of truth: `js/api.js`.

### Core Integration Standards:
1.  **Session Propagation**: The UI automatically retrieves the active session from storage and appends the user's role and identification tokens onto HTTP headers (`x-role` and `x-user-id`) dynamically on every request.
2.  **API Decoupling**: HTML pages never call the `fetch()` API directly. Instead, they import modules from `api.js` (e.g., `apiSubmitApplication(data)`). This design keeps your front-end controllers clean, modular, and decoupled from remote hostname changes.

---

## 🧭 Page Initialization & Navigation Core (`js/navigation.js`)

To replicate dynamic single-page application behaviors while retaining simple multi-page files, the client utilizes a centralized initialization interceptor: `js/navigation.js`.

### How Page Security & Building Works:
Every dashboard or sub-page imports `navigation.js` and calls the page initialization routine:
-   **Security Check**: Validates the active user session. If a user tries to access a page they don't have permission for (e.g., a citizen opening a supervisor page), it automatically redirects them back to `login.html`.
-   **Dynamic Template Injection**: Injects identical, unified sidebars, responsive navigation grids, and user profile menus into the DOM on the fly, eliminating structural code repetition across files.

---

## 🎨 CSS Design System & Visual Tokens

Styling utilizes a custom HSL palette configured to mimic modern, professional enterprise applications.
*   **Root Colors**:
    *   `--primary`: Deep Slate (`#0f172a`)
    *   `--accent`: Slate Blue (`#3b82f6`)
    *   `--success`: Forest Green (`#22c55e`)
    *   `--warning`: Amber Gold (`#f59e0b`)
    *   `--danger`: Crimson Red (`#ef4444`)
*   **Key Design Tokens**: Integrated glassmorphic cards, custom utility hover transformations, and responsive grid layouts designed to support both standard desktop monitors and mobile browsers.

---

## 🚀 Running the Frontend

### Method 1: Local Server (Highly Recommended)
Ensure you are in the `/front-end` directory and spin up a lightweight development static server to prevent CORS issues or protocol blockers:
```bash
npx serve .
```

### Method 2: Direct Execution
If you do not have node tools on the client system, you can open `index.html` directly in any modern browser by double-clicking it.
*(Note: Browser security policies might restrict cross-origin script loads if accessing via the `file://` protocol depending on system permissions. Serving via HTTP standard is strongly advised).*
