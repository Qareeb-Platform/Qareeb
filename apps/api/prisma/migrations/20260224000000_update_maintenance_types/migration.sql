-- Add new values to MaintenanceType enum (idempotent)
ALTER TYPE "MaintenanceType" ADD VALUE IF NOT EXISTS 'Plumbing';
ALTER TYPE "MaintenanceType" ADD VALUE IF NOT EXISTS 'Electrical';
ALTER TYPE "MaintenanceType" ADD VALUE IF NOT EXISTS 'Carpentry';
ALTER TYPE "MaintenanceType" ADD VALUE IF NOT EXISTS 'Painting';
ALTER TYPE "MaintenanceType" ADD VALUE IF NOT EXISTS 'AC_Repair';
ALTER TYPE "MaintenanceType" ADD VALUE IF NOT EXISTS 'Cleaning';
ALTER TYPE "MaintenanceType" ADD VALUE IF NOT EXISTS 'Other';
