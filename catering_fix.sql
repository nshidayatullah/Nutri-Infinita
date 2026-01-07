-- Fix Missing Columns in Caterings Table matches MasterCateringPage UI
alter table caterings add column if not exists is_active boolean default true;

-- Ensure address column exists (already in create script but good to double check)
alter table caterings add column if not exists address text;

-- Update existing data to defaults
update caterings set is_active = true where is_active is null;
