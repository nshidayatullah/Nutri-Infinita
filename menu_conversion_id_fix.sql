-- Add conversion_id to dish_ingredients to allow correct loading of saved menus
alter table dish_ingredients add column if not exists conversion_id bigint references conversion_factors(id);

-- Optional: Update existing records to link to 'Mentah' (factor 1) if factory is 1? 
-- No, risky. Better start fresh or let old data be manual.
