-- Disable Row-Level Security on all tables
-- The application uses application-level access control (middleware + route handlers)
-- Not database-level RLS policies
SET search_path = resilio_schema, public;

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE pins DISABLE ROW LEVEL SECURITY;
ALTER TABLE supply_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE local_hubs DISABLE ROW LEVEL SECURITY;
ALTER TABLE hub_memberships DISABLE ROW LEVEL SECURITY;
