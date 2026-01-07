-- 1. Pastikan kolom conversion_id ada dan Foreign Key benar
alter table dish_ingredients 
add column if not exists conversion_id bigint references conversion_factors(id);

-- 2. Memaksa PostgREST untuk refresh schema cache
-- Biasanya DDL trigger refresh, tapi kadang perlu dipancing
NOTIFY pgrst, 'reload schema';

-- 3. Cek apakah tabel conversion_factors memiliki Primary Key (Required for relation)
-- (Ini biasanya sudah ada, tapi untuk memastikan)
-- alter table conversion_factors add primary key (id); -- Commented out, run only if needed
