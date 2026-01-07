# Tutorial Setup Supabase untuk Catering Nutrition App

## Step 1: Buat Supabase Account & Project Baru

1. Buka [https://supabase.com](https://supabase.com)
2. Klik **"Start your project"** atau **"Sign In"** (jika sudah punya akun)
3. Login menggunakan GitHub account Anda
4. Setelah login, klik **"New Project"**
5. Isi form:
   - **Name**: `catering-nutrition-app` (atau nama lain yang Anda inginkan)
   - **Database Password**: Buat password yang kuat dan **SIMPAN** (akan digunakan untuk akses database langsung)
   - **Region**: Pilih **Southeast Asia (Singapore)** untuk latensi terbaik
   - **Pricing Plan**: Pilih **Free** (sudah cukup untuk development)
6. Klik **"Create new project"**
7. Tunggu 1-2 menit sampai project selesai dibuat

---

## Step 2: Dapatkan API Credentials

Setelah project selesai dibuat:

1. Di sidebar kiri, klik **"Settings"** (ikon gear)
2. Klik **"API"**
3. Copy 2 nilai berikut:
   - **Project URL** (contoh: `https://abcdefghijklmn.supabase.co`)
   - **anon public** key (panjang, mulai dengan `eyJ...`)

**JANGAN** share kedua nilai ini ke orang lain!

---

## Step 3: Setup Environment Variables di Aplikasi

1. Di terminal, navigate ke folder aplikasi:

   ```bash
   cd /Users/m.hidayatullah/.gemini/antigravity/scratch/catering-nutrition-app/app
   ```

2. Copy file `.env.example` menjadi `.env`:

   ```bash
   cp .env.example .env
   ```

3. Edit file `.env` dan masukkan credentials tadi:

   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...
   ```

4. **RESTART** dev server agar env variables ter-load:
   ```bash
   # Tekan Ctrl+C untuk stop server yang sedang berjalan
   # Lalu run lagi:
   npm run dev
   ```

---

## Step 4: Jalankan Database Schema

1. Di Supabase Dashboard, klik **"SQL Editor"** di sidebar kiri
2. Klik **"New query"**
3. Copy-paste **SELURUH ISI** file `schema.sql` ke dalam editor
4. Klik **"Run"** (tombol play di kanan atas)
5. Tunggu sampai muncul notifikasi **"Success. No rows returned"**

---

## Step 5: (Opsional) Insert Sample Data

Untuk testing, Anda bisa insert data contoh:

1. Tetap di **SQL Editor**, buat query baru
2. Copy-paste **SELURUH ISI** file `seed.sql`
3. Klik **"Run"**
4. Cek di **"Table Editor"** → Pilih tabel `caterings` untuk verifikasi data sudah masuk

---

## Step 6: Verifikasi Koneksi dari Aplikasi

Setelah semua setup selesai, test koneksi:

1. Buka aplikasi di browser: **http://localhost:5174/**
2. Buka **Console** di browser (F12 → Console tab)
3. Tidak ada error "Missing Supabase environment variables"
4. (Nanti) Data akan muncul setelah kita implement fetch dari Supabase

---

## Troubleshooting

### Error: "Missing Supabase environment variables"

- Pastikan file `.env` ada di folder `/app`
- Pastikan nama variabelnya **PERSIS** `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
- Restart dev server setelah edit `.env`

### Error saat Run Schema SQL

- Pastikan copy **SEMUA** baris dari `schema.sql`, termasuk baris pertama dan terakhir
- Jika ada error "relation already exists", berarti tabel sudah pernah dibuat. Anda bisa skip atau drop table dulu:
  ```sql
  DROP TABLE IF EXISTS dish_ingredients CASCADE;
  DROP TABLE IF EXISTS dishes CASCADE;
  DROP TABLE IF EXISTS daily_menus CASCADE;
  DROP TABLE IF EXISTS processing_methods CASCADE;
  DROP TABLE IF EXISTS reference_standards CASCADE;
  DROP TABLE IF EXISTS ingredients_library CASCADE;
  DROP TABLE IF EXISTS caterings CASCADE;
  DROP VIEW IF EXISTS view_menu_nutrition;
  ```

### Lupa Database Password

- Password ini hanya untuk akses direct ke PostgreSQL (advanced usage)
- Untuk aplikasi web, kita HANYA butuh **URL** dan **Anon Key** (tidak perlu password)

---

## Next Steps

Setelah Supabase setup selesai, saya akan lanjutkan:

1. ✅ Koneksi aplikasi ke Supabase
2. ✅ Implementasi halaman Master Data (CRUD Catering & Bahan Makanan)
3. ✅ Halaman Input Menu dengan kalkulator gizi real-time
