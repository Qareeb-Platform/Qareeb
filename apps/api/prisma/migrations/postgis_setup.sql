-- PostGIS Extension and Geography columns migration
-- This runs after Prisma creates the base tables

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geography columns to imams
ALTER TABLE imams ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- Add geography columns to halaqat
ALTER TABLE halaqat ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- Add geography columns to maintenance_requests  
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- Create function to auto-update location from lat/lng
CREATE OR REPLACE FUNCTION update_location_from_coords()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating location
CREATE TRIGGER trg_imams_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON imams
  FOR EACH ROW EXECUTE FUNCTION update_location_from_coords();

CREATE TRIGGER trg_halaqat_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON halaqat
  FOR EACH ROW EXECUTE FUNCTION update_location_from_coords();

CREATE TRIGGER trg_maintenance_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION update_location_from_coords();

-- Geospatial indexes (GIST)
CREATE INDEX IF NOT EXISTS idx_imams_location ON imams USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_halaqat_location ON halaqat USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_maintenance_location ON maintenance_requests USING GIST(location);

-- GIN index for maintenance types array
CREATE INDEX IF NOT EXISTS idx_maintenance_types ON maintenance_requests USING GIN(maintenance_types);
