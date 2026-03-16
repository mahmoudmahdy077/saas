-- MedLog SaaS - Database Performance Indexes
-- Run these to improve query performance

-- Cases table indexes
CREATE INDEX IF NOT EXISTS cases_user_id_idx ON cases(user_id);
CREATE INDEX IF NOT EXISTS cases_institution_id_idx ON cases(institution_id);
CREATE INDEX IF NOT EXISTS cases_created_at_idx ON cases(created_at DESC);
CREATE INDEX IF NOT EXISTS cases_updated_at_idx ON cases(updated_at DESC);
CREATE INDEX IF NOT EXISTS cases_status_idx ON cases(status);

-- Users table indexes
CREATE INDEX IF NOT EXISTS users_institution_id_idx ON users(institution_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Institutions table indexes
CREATE INDEX IF NOT EXISTS institutions_owner_id_idx ON institutions(owner_id);

-- Sessions table indexes
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);

-- Audit logs (if exists)
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS cases_user_created_idx ON cases(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS cases_institution_status_idx ON cases(institution_id, status);

-- Analyze tables after creating indexes
ANALYZE cases;
ANALYZE users;
ANALYZE institutions;
