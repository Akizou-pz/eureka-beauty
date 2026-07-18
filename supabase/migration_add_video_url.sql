-- Safe, additive migration to support product videos without any data loss.
-- Run this query in your Supabase SQL Editor.
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT;
