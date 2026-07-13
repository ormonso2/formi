-- Add JSON files column to jobs table for multi-file upload support
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS files JSONB;
