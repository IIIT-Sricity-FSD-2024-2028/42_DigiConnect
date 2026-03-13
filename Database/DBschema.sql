DROP DATABASE IF EXISTS DigiConnect_db;
CREATE DATABASE DigiConnect_db;
USE DigiConnect_db;

CREATE TABLE roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(30) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE,
    phone VARCHAR(15) UNIQUE,
    password_hash TEXT NOT NULL,
    identity_no VARCHAR(20) UNIQUE,
    address TEXT,
    dob DATE,
    gender VARCHAR(10),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
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

CREATE TABLE officer_profiles (
    profile_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    department_id BIGINT NOT NULL,
    employee_code VARCHAR(50) UNIQUE,
    designation VARCHAR(80) NOT NULL,
    jurisdiction VARCHAR(120) NOT NULL,
    avg_processing_time DECIMAL(5,2),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    onboarded_by BIGINT,
    onboarded_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (onboarded_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE service_categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE services (
    service_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(150) NOT NULL,
    description TEXT,
    fee_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    active_flag BOOLEAN NOT NULL DEFAULT TRUE,
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
    max_processing_days INT NOT NULL,
    escalation_after_days INT,
    applicable_to VARCHAR(30),
    active_flag BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (service_id, sla_no),
    KEY (sla_no),
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);

CREATE TABLE applications (
    application_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_number VARCHAR(30) NOT NULL UNIQUE,
    service_id BIGINT NOT NULL,
    citizen_id BIGINT NOT NULL,
    current_status VARCHAR(40) NOT NULL DEFAULT 'DRAFT',
    submission_date TIMESTAMP,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sla_due_at TIMESTAMP,
    remarks TEXT,
    is_renewal BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (service_id) REFERENCES services(service_id),
    FOREIGN KEY (citizen_id) REFERENCES users(user_id)
);

CREATE TABLE application_documents (
    document_no BIGINT AUTO_INCREMENT,
    application_id BIGINT NOT NULL,
    requirement_no BIGINT,
    file_name VARCHAR(200) NOT NULL,
    file_type VARCHAR(50),
    file_url TEXT,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
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
    payment_method VARCHAR(20),
    transaction_ref VARCHAR(80) UNIQUE,
    paid_at TIMESTAMP,
    gateway_response TEXT,
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
    CONSTRAINT chk_payment_method CHECK (
        payment_status = 'INITIATED'
        OR payment_method IS NOT NULL
    )
);

CREATE TABLE grievance_categories (
    grievance_category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(80) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE grievances (
    grievance_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    grievance_number VARCHAR(30) NOT NULL UNIQUE,
    citizen_id BIGINT NOT NULL,
    grievance_category_id BIGINT,
    application_id BIGINT,
    service_id BIGINT,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    grievance_status VARCHAR(20) NOT NULL DEFAULT 'REGISTERED',
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
    assigned_to BIGINT,
    assigned_at TIMESTAMP,
    resolution_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sla_due_at TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES users(user_id),
    FOREIGN KEY (grievance_category_id) REFERENCES grievance_categories(grievance_category_id),
    FOREIGN KEY (application_id) REFERENCES applications(application_id),
    FOREIGN KEY (service_id) REFERENCES services(service_id),
    FOREIGN KEY (assigned_to) REFERENCES users(user_id),
    CONSTRAINT chk_grievance_link CHECK (service_id IS NOT NULL OR application_id IS NOT NULL)
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

CREATE TABLE notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    message TEXT,
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

CREATE TABLE audit_logs (
    audit_log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    service_id BIGINT,
    grievance_id BIGINT,
    application_id BIGINT,
    action VARCHAR(100),
    entity_type VARCHAR(30),
    entity_id BIGINT,
    old_value TEXT,
    new_value TEXT,
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

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_officer_dept ON officer_profiles(department_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_department ON services(department_id);
CREATE INDEX idx_services_active ON services(active_flag);
CREATE INDEX idx_applications_citizen ON applications(citizen_id);
CREATE INDEX idx_applications_service ON applications(service_id);
CREATE INDEX idx_applications_status ON applications(current_status);
CREATE INDEX idx_applications_sla ON applications(sla_due_at);
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
CREATE INDEX idx_grv_attach_grievance ON grievance_attachments(grievance_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read_status);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(action_timestamp);


SHOW TABLES;
