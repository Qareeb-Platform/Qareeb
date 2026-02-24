-- Add new values to existing enum (PostgreSQL 9.3+)
ALTER TYPE "MaintenanceType" ADD VALUE IF NOT EXISTS 'Plumbing';
ALTER TYPE "MaintenanceType" ADD VALUE IF NOT EXISTS 'Electrical';
ALTER TYPE "MaintenanceType" ADD VALUE IF NOT EXISTS 'Carpentry';
ALTER TYPE "MaintenanceType" ADD VALUE IF NOT EXISTS 'Painting';
ALTER TYPE "MaintenanceType" ADD VALUE IF NOT EXISTS 'AC_Repair';
ALTER TYPE "MaintenanceType" ADD VALUE IF NOT EXISTS 'Cleaning';
ALTER TYPE "MaintenanceType" ADD VALUE IF NOT EXISTS 'Other';
