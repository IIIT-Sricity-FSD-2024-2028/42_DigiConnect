DROP DATABASE IF EXISTS DigiConnect_db;
CREATE DATABASE DigiConnect_db;
USE DigiConnect_db;

CREATE TABLE roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(30) NOT NULL UNIQUE,    -- 'citizen' | 'officer' | 'supervisor' | 'grievance' | 'super_user'
    description TEXT
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CHANGE: Added security_question and security_answer columns to support the
--         mock-data securityQuestion / securityAnswer fields used for password
--         recovery on the citizen and officer login flows.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE,
    phone VARCHAR(15) UNIQUE,
    password_hash TEXT NOT NULL,
    identity_no VARCHAR(20) UNIQUE,          -- maps to mock `aadhaar`
    address TEXT,
    dob DATE,
    gender VARCHAR(10),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',  -- 'ACTIVE' | 'Suspended' | 'Pending'
    security_question VARCHAR(200),          -- NEW: mock securityQuestion
    security_answer TEXT,                    -- NEW: mock securityAnswer (store hashed in prod)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    CONSTRAINT chk_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE departments (
    department_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    contact_email VARCHAR(120) UNIQUE,
    contact_phone VARCHAR(15) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CHANGE: Added sla_percentage and active_cases_count to capture the `sla` and
--         `cases` fields present on every officer entry in MOCK_USERS (e.g.
--         { sla: 91, cases: 28 }).  These can be refreshed by a nightly job or
--         updated on each decision event.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE officer_profiles (
    profile_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    department_id BIGINT NOT NULL,
    employee_code VARCHAR(50) UNIQUE,
    designation VARCHAR(80) NOT NULL,        -- maps to mock `title` (VRO, RI, MRO …)
    jurisdiction VARCHAR(120) NOT NULL,
    avg_processing_time DECIMAL(5,2),
    sla_percentage DECIMAL(5,2),             -- NEW: mock `sla` (e.g. 91.00)
    active_cases_count INT NOT NULL DEFAULT 0, -- NEW: mock `cases` (e.g. 28)
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    onboarded_by BIGINT,
    onboarded_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (onboarded_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- NEW TABLE: officer_services
-- Each officer entry in MOCK_USERS carries a `services` array listing the
-- service names that officer handles (e.g. ['Income Certificate', 'Caste
-- Certificate']).  This junction table persists that many-to-many relationship.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE officer_services (
    officer_user_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (officer_user_id, service_id),
    FOREIGN KEY (officer_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────────────────────
-- NEW TABLE: officer_onboarding_requests
-- Captures MOCK_PENDING_OFFICERS: officers who have applied to join the platform
-- but have not yet been approved by a super_user.  The `docs` column stores a
-- JSON array of document names (e.g. ['Employee ID', 'Appointment Order']).
-- Requested services are normalised into officer_onboarding_request_services.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE officer_onboarding_requests (
    request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provisional_id VARCHAR(20) NOT NULL UNIQUE,  -- mock `id` e.g. 'EMP-039'
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(15) UNIQUE,
    designation VARCHAR(80) NOT NULL,
    department_id BIGINT,
    jurisdiction VARCHAR(120),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    request_status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'APPROVED' | 'REJECTED'
    docs JSON,                                   -- e.g. ["Employee ID","Appointment Order"]
    reviewed_by BIGINT,
    reviewed_at TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE officer_onboarding_request_services (
    request_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    PRIMARY KEY (request_id, service_id),
    FOREIGN KEY (request_id) REFERENCES officer_onboarding_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);

CREATE TABLE service_categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(120) NOT NULL UNIQUE,  -- 'Certificate' | 'Welfare' | 'Permission' | 'Correction'
    description TEXT
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CHANGE: Replaced active_flag BOOLEAN with status VARCHAR(20) to support the
--         three states used in MOCK_SERVICES: 'Active', 'Draft', 'Inactive'.
-- CHANGE: Added icon VARCHAR(30) — mock `icon` field ('cert','welfare',
--         'permission','correction') used by the UI to render service cards.
-- CHANGE: Added color VARCHAR(50) — mock `color` field stores a CSS variable
--         or hex string used for service card theming.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE services (
    service_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(150) NOT NULL,
    description TEXT,
    fee_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Active', -- NEW: 'Active' | 'Draft' | 'Inactive'
    icon VARCHAR(30),                              -- NEW: mock `icon`
    color VARCHAR(50),                             -- NEW: mock `color`
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES service_categories(category_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

CREATE TABLE requirements (
    requirement_no BIGINT AUTO_INCREMENT,
    service_id BIGINT NOT NULL,
    requirement_name VARCHAR(150) NOT NULL,
    requirement_type VARCHAR(50) NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    validation_rules TEXT,
    remarks TEXT,
    PRIMARY KEY (service_id, requirement_no),
    KEY (requirement_no),
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);

CREATE TABLE workflow_stages (
    stage_no BIGINT AUTO_INCREMENT,
    service_id BIGINT NOT NULL,
    stage_name VARCHAR(80) NOT NULL,
    stage_order INT NOT NULL,
    description TEXT,
    is_final_stage BOOLEAN NOT NULL DEFAULT FALSE,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (service_id, stage_no),
    KEY (stage_no),
    UNIQUE (service_id, stage_order),
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE sla_policies (
    sla_no BIGINT AUTO_INCREMENT,
    service_id BIGINT NOT NULL,
    sla_name VARCHAR(80) NOT NULL,
    max_processing_days INT NOT NULL,        -- maps to mock `sla` days per service
    escalation_after_days INT,
    applicable_to VARCHAR(30),
    active_flag BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (service_id, sla_no),
    KEY (sla_no),
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);

CREATE TABLE applications (
    application_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_number VARCHAR(30) NOT NULL UNIQUE,  -- mock `id` e.g. 'APP-2456'
    service_id BIGINT NOT NULL,
    citizen_id BIGINT NOT NULL,
    current_status VARCHAR(40) NOT NULL DEFAULT 'DRAFT',
    -- Supported statuses from mock: 'DRAFT' | 'under-review' | 'query' |
    -- 'escalated' | 'approved' | 'completed' | 'rejected'
    submission_date TIMESTAMP,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sla_due_at TIMESTAMP,
    remarks TEXT,
    is_renewal BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (service_id) REFERENCES services(service_id),
    FOREIGN KEY (citizen_id) REFERENCES users(user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- NEW TABLE: application_timeline
-- Captures the `timeline` array present on every application in
-- MOCK_APPLICATIONS (and OFFICER_QUEUE history arrays).  Each row is one
-- timeline event: who did what, when, and any note.  actor_type distinguishes
-- between 'citizen', 'officer', 'system', 'supervisor', etc.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE application_timeline (
    timeline_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    action VARCHAR(150) NOT NULL,            -- mock `action` / `label`
    action_date TIMESTAMP NOT NULL,          -- mock `date` / `ts`
    actor_name VARCHAR(120),                 -- mock `actor` (free-text name or 'System')
    actor_user_id BIGINT,                    -- resolved FK when actor is a known user
    actor_type VARCHAR(20),                  -- 'citizen' | 'officer' | 'system' | 'supervisor'
    note TEXT,                               -- mock `note` / `detail`
    dot_type VARCHAR(20),                    -- mock `dot` ('submitted','assign','review','breach'…)
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY (actor_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- NEW TABLE: application_metadata
-- Service applications carry service-specific extra fields in the mock data
-- (income, purpose, occupation, community, religion, category, recordType,
-- incorrect, correct, reason, residenceType, duration …).  A key-value store
-- avoids wide sparse columns and supports any future service type.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE application_metadata (
    application_id BIGINT NOT NULL,
    meta_key VARCHAR(80) NOT NULL,           -- e.g. 'income', 'purpose', 'occupation'
    meta_value TEXT,
    PRIMARY KEY (application_id, meta_key),
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────────────────────
-- NEW TABLE: application_checklist
-- OFFICER_QUEUE entries include a `checklist` array of verification items that
-- the officer must tick off before approving.  Each row is one checklist item
-- for a specific application.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE application_checklist (
    checklist_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    item_order INT NOT NULL DEFAULT 0,
    item_text TEXT NOT NULL,                 -- mock checklist string
    is_checked BOOLEAN NOT NULL DEFAULT FALSE,
    checked_by BIGINT,
    checked_at TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY (checked_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE application_documents (
    document_no BIGINT AUTO_INCREMENT,
    application_id BIGINT NOT NULL,
    requirement_no BIGINT,
    file_name VARCHAR(200) NOT NULL,
    file_type VARCHAR(50),
    file_url TEXT,
    file_size VARCHAR(20),                   -- e.g. '310 KB' (from OFFICER_QUEUE docs)
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    -- 'PENDING' | 'verified' | 'query' (mock `status` on documents)
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    PRIMARY KEY (application_id, document_no),
    KEY (document_no),
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY (requirement_no) REFERENCES requirements(requirement_no)
);

CREATE TABLE application_queries (
    query_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    raised_by BIGINT NOT NULL,
    answered_by BIGINT,
    question TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    raised_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answer_text TEXT,
    answered_at TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY (raised_by) REFERENCES users(user_id),
    FOREIGN KEY (answered_by) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT chk_answer_completeness CHECK (
        (status='ANSWERED' AND answer_text IS NOT NULL AND answered_at IS NOT NULL)
        OR status <> 'ANSWERED'
    )
);

CREATE TABLE payments (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'INITIATED',
    -- 'INITIATED' | 'paid' | 'waived' (mock paymentStatus values)
    payment_method VARCHAR(20),
    -- 'UPI' | 'Card' | 'free' | NULL (mock paymentMethod values)
    transaction_ref VARCHAR(80) UNIQUE,
    paid_at TIMESTAMP,
    gateway_response TEXT,
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
    CONSTRAINT chk_payment_method CHECK (
        payment_status IN ('INITIATED', 'waived')
        OR payment_method IS NOT NULL
    )
);

CREATE TABLE grievance_categories (
    grievance_category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(80) NOT NULL UNIQUE, -- 'delay' | 'rejection' | 'payment' | 'misconduct'
    description TEXT
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CHANGE: Added sla_status VARCHAR(10) — mock `slaStatus` field ('safe' |
--         'warn' | 'breach') is stored because the actual dates age in
--         production and this snapshot value is needed for display.
-- CHANGE: Added last_updated_at TIMESTAMP — mock `lastUpdated` field.
-- CHANGE: Added closed_date TIMESTAMP — mock `closedDate` field (distinct from
--         resolved_at which is used internally; closedDate is citizen-facing).
-- CHANGE: Added days_taken INT — mock `daysTaken` computed and stored for
--         reporting without re-computing on every query.
-- CHANGE: Added resolved_by_name VARCHAR(120) — mock `resolvedBy` is a display
--         string (e.g. 'Supervisor: Anita Sharma') not always a single user FK.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE grievances (
    grievance_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    grievance_number VARCHAR(30) NOT NULL UNIQUE,   -- mock `id` e.g. 'GRV-051'
    citizen_id BIGINT NOT NULL,
    grievance_category_id BIGINT,
    application_id BIGINT,
    service_id BIGINT,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    grievance_status VARCHAR(30) NOT NULL DEFAULT 'REGISTERED',
    -- 'open' | 'investigating' | 'escalated' | 'resolved' | 'rejected' | 'escalated-resolved'
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',  -- 'low' | 'medium' | 'high'
    sla_status VARCHAR(10) NOT NULL DEFAULT 'safe',  -- NEW: 'safe' | 'warn' | 'breach'
    assigned_to BIGINT,
    assigned_at TIMESTAMP,
    resolution_note TEXT,
    resolved_by_name VARCHAR(120),               -- NEW: display string e.g. 'Supervisor: Anita Sharma'
    days_taken INT,                              -- NEW: mock `daysTaken`
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- NEW: mock `lastUpdated`
    sla_due_at TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES users(user_id),
    FOREIGN KEY (grievance_category_id) REFERENCES grievance_categories(grievance_category_id),
    FOREIGN KEY (application_id) REFERENCES applications(application_id),
    FOREIGN KEY (service_id) REFERENCES services(service_id),
    FOREIGN KEY (assigned_to) REFERENCES users(user_id),
    CONSTRAINT chk_grievance_link CHECK (service_id IS NOT NULL OR application_id IS NOT NULL)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- NEW TABLE: grievance_timeline
-- Captures the `history` array on every grievance in MOCK_GRIEVANCES.  Each
-- row is one history event.  Mirrors application_timeline structure for
-- consistency.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE grievance_timeline (
    timeline_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    grievance_id BIGINT NOT NULL,
    action VARCHAR(150) NOT NULL,            -- mock `action`
    action_date TIMESTAMP NOT NULL,          -- mock `date`
    actor_name VARCHAR(120),                 -- mock `actor`
    actor_user_id BIGINT,
    note TEXT,                               -- mock `note`
    FOREIGN KEY (grievance_id) REFERENCES grievances(grievance_id) ON DELETE CASCADE,
    FOREIGN KEY (actor_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE grievance_attachments (
    attachment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    grievance_id BIGINT,
    uploaded_by BIGINT,
    file_url TEXT,
    file_name VARCHAR(200),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grievance_id) REFERENCES grievances(grievance_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CHANGE: Added title VARCHAR(150) — mock `title` field on notifications
--         (e.g. 'Application Approved!', 'Query Raised').
-- CHANGE: Added notification_type VARCHAR(20) — mock `type` field
--         ('success' | 'warning' | 'info' | 'danger') for UI styling.
-- CHANGE: Added link VARCHAR(255) — mock `link` field, a relative URL that the
--         UI navigates to when the notification is clicked.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    title VARCHAR(150),                      -- NEW: mock `title`
    message TEXT,
    notification_type VARCHAR(20),           -- NEW: mock `type` ('success'|'warning'|'info'|'danger')
    link VARCHAR(255),                       -- NEW: mock `link`
    channel VARCHAR(10),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_status BOOLEAN DEFAULT FALSE,
    application_id BIGINT,
    grievance_id BIGINT,
    trigger_event VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (application_id) REFERENCES applications(application_id),
    FOREIGN KEY (grievance_id) REFERENCES grievances(grievance_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CHANGE: Added actor_email VARCHAR(120) — mock `actor` is stored as an email
--         string in MOCK_AUDIT_LOGS (e.g. 'admin@DigiConnect.com').
-- CHANGE: Added actor_role VARCHAR(30) — mock `role` field on audit log entries
--         ('admin' | 'officer' | 'citizen' | 'grievance').
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
    audit_log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    actor_email VARCHAR(120),                -- NEW: mock `actor` email string
    actor_role VARCHAR(30),                  -- NEW: mock `role`
    service_id BIGINT,
    grievance_id BIGINT,
    application_id BIGINT,
    action VARCHAR(100),
    entity_type VARCHAR(30),
    entity_id BIGINT,
    old_value TEXT,
    new_value TEXT,
    details TEXT,                            -- NEW: mock `details` free-text description
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (service_id) REFERENCES services(service_id),
    FOREIGN KEY (grievance_id) REFERENCES grievances(grievance_id),
    FOREIGN KEY (application_id) REFERENCES applications(application_id)
);

CREATE TABLE user_roles (
    user_id BIGINT,
    role_id BIGINT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active_flag BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE application_assignments (
    assignment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT,
    assigned_to BIGINT,
    assigned_by BIGINT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unassigned_at TIMESTAMP,
    assignment_status VARCHAR(20) DEFAULT 'ACTIVE',
    reassignment_reason TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (application_id) REFERENCES applications(application_id),
    FOREIGN KEY (assigned_to) REFERENCES users(user_id),
    FOREIGN KEY (assigned_by) REFERENCES users(user_id)
);

CREATE TABLE application_decisions (
    decision_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT,
    decided_by BIGINT,
    decision_type VARCHAR(20),
    decision_note TEXT,
    decision_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    overridden_flag BOOLEAN DEFAULT FALSE,
    from_stage VARCHAR(80),
    to_stage VARCHAR(80),
    FOREIGN KEY (application_id) REFERENCES applications(application_id),
    FOREIGN KEY (decided_by) REFERENCES users(user_id)
);

CREATE TABLE application_escalations (
    escalation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT,
    escalated_by BIGINT,
    escalated_to BIGINT,
    escalation_type VARCHAR(30),
    escalation_reason TEXT,
    escalated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    escalation_status VARCHAR(20) DEFAULT 'PENDING',
    FOREIGN KEY (application_id) REFERENCES applications(application_id),
    FOREIGN KEY (escalated_by) REFERENCES users(user_id),
    FOREIGN KEY (escalated_to) REFERENCES users(user_id)
);

CREATE TABLE grievance_escalations (
    escalation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    grievance_id BIGINT,
    escalated_by BIGINT,
    escalated_to BIGINT,
    escalation_reason TEXT,
    escalated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    escalation_status VARCHAR(20) DEFAULT 'PENDING',
    FOREIGN KEY (grievance_id) REFERENCES grievances(grievance_id),
    FOREIGN KEY (escalated_by) REFERENCES users(user_id),
    FOREIGN KEY (escalated_to) REFERENCES users(user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- NEW TABLE: settings
-- Stores MOCK_SETTINGS: platform-wide configuration grouped into categories
-- (general, sla, notifications, security, maintenance).  Each row is one
-- key-value pair.  setting_group maps to the mock top-level key;
-- setting_key maps to the inner key; setting_value stores the value as TEXT.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE settings (
    setting_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_group VARCHAR(50) NOT NULL,       -- 'general' | 'sla' | 'notifications' | 'security' | 'maintenance'
    setting_key VARCHAR(80) NOT NULL,         -- e.g. 'platformName', 'slaCert', 'emailEnabled'
    setting_value TEXT,                       -- stored as text; cast on read
    updated_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (setting_group, setting_key),
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_officer_dept ON officer_profiles(department_id);
CREATE INDEX idx_officer_services_officer ON officer_services(officer_user_id);
CREATE INDEX idx_officer_services_service ON officer_services(service_id);
CREATE INDEX idx_onboarding_status ON officer_onboarding_requests(request_status);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_department ON services(department_id);
CREATE INDEX idx_services_status ON services(status);             -- replaces idx_services_active
CREATE INDEX idx_applications_citizen ON applications(citizen_id);
CREATE INDEX idx_applications_service ON applications(service_id);
CREATE INDEX idx_applications_status ON applications(current_status);
CREATE INDEX idx_applications_sla ON applications(sla_due_at);
CREATE INDEX idx_app_timeline_app ON application_timeline(application_id);
CREATE INDEX idx_app_timeline_date ON application_timeline(action_date);
CREATE INDEX idx_app_metadata_app ON application_metadata(application_id);
CREATE INDEX idx_app_checklist_app ON application_checklist(application_id);
CREATE INDEX idx_app_docs_app ON application_documents(application_id);
CREATE INDEX idx_app_queries_app ON application_queries(application_id);
CREATE INDEX idx_app_queries_status ON application_queries(status);
CREATE INDEX idx_payments_app ON payments(application_id);
CREATE INDEX idx_assignments_app ON application_assignments(application_id);
CREATE INDEX idx_assignments_officer ON application_assignments(assigned_to);
CREATE INDEX idx_decisions_app ON application_decisions(application_id);
CREATE INDEX idx_decisions_user ON application_decisions(decided_by);
CREATE INDEX idx_grievances_citizen ON grievances(citizen_id);
CREATE INDEX idx_grievances_status ON grievances(grievance_status);
CREATE INDEX idx_grievances_priority ON grievances(priority);
CREATE INDEX idx_grievances_sla_status ON grievances(sla_status);    -- NEW
CREATE INDEX idx_grv_timeline_grievance ON grievance_timeline(grievance_id); -- NEW
CREATE INDEX idx_grv_attach_grievance ON grievance_attachments(grievance_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read_status);
CREATE INDEX idx_notifications_type ON notifications(notification_type);  -- NEW
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(action_timestamp);
CREATE INDEX idx_settings_group ON settings(setting_group);              -- NEW

SHOW TABLES;
