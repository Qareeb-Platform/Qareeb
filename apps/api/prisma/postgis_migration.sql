-- Qareeb Platform — PostGIS Migration
-- This file should be appended to the auto-generated migration SQL

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geography columns for spatial queries
ALTER TABLE imams ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);
ALTER TABLE halaqat ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);

-- GiST spatial indexes for fast radius queries
CREATE INDEX IF NOT EXISTS idx_imams_location ON imams USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_halaqat_location ON halaqat USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_maintenance_location ON maintenance_requests USING GIST(location);
