-- Seed Data for Caterings
insert into caterings (name, contact_person, phone) values
('KPS', 'Budi', '08123456789'),
('Berkah Catering', 'Siti', '08129876543'),
('Sehat Selalu', 'Andi', '08134567890'),
('Gizi Utama', 'Dewi', '08145678901');

-- Seed Data for Processing Methods (Faktor Konversi)
-- Data estimasi (user perlu verifikasi dengan standar Kemenkes/Buku Pedoman)
insert into processing_methods (name, conversion_factor) values
('Mentah', 1.0),
('Rebus', 1.0),
('Kukus', 1.0),
('Goreng', 0.6), -- Contoh: Berat menyusut
('Tumis', 0.8),
('Nasi', 0.4); -- Beras ke Nasi (Nasi 100g berasal dari beras approx 40g)

-- Seed Data for Reference Standards (AKG Umum - Contoh)
insert into reference_standards (name) values ('Standar Dewasa Umum');

-- Seed Data for Ingredients (Sample from TKPI Image)
-- AR001: Beras giling, mentah
insert into ingredients_library (
  code, name, source, category,
  water_g, energy_kcal, protein_g, fat_g, carbs_g, fiber_g, ash_g,
  calcium_mg, phosphorus_mg, iron_mg, sodium_mg, potassium_mg, copper_mg, zinc_mg,
  retinol_mcg, beta_carotene_mcg, total_carotene_mcg, thiamin_mg, riboflavin_mg, niacin_mg, vitamin_c_mg,
  default_bdd_percent
) values 
(
  'AR001', 'Beras giling, mentah', 'KZGMI-2001', 'Serealia',
  12.0, 357, 8.4, 1.7, 77.1, 0.2, 0.8,
  147, 81, 1.8, 27, 71, 0.1, 0.5,
  0, 0, 0, 0.2, 0.08, 2.6, 0,
  100
),
(
  'AP001', 'Nasi', 'KZGPI-1990', 'Serealia',
  56.7, 180, 3.0, 0.3, 39.8, 0.2, 0.2,
  25, 27, 0.4, 1, 38, 0.1, 0.6,
  0, 0, 0, 0.05, 0.1, 2.6, 0,
  100
),
(
  'XXX', 'Telur ayam ras, segar', 'TKPI', 'Lauk Hewani',
  74.0, 150, 12.0, 10.0, 1.0, 0.0, 1.0,
  50, 150, 2.0, 100, 120, 0.1, 1.0,
  100, 0, 0, 0.1, 0.2, 0.1, 0,
  90 -- BDD Telur (tanpa cangkang)
);
