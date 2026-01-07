# Summary of Catering Nutrition App Design

## 1. Project Overview

Aplikasi ini dirancang untuk menghitung Nilai Gizi dari 4 Katering dengan standar 850 kkal/menu. Sistem mendukung input dari Ahli Gizi berupa **Berat Matang** yang dikonversi otomatis menjadi Berat Mentah Bersih (BDD) menggunakan faktor konversi.

**User Utama:** Admin / Ahli Gizi (Single Login).

---

## 2. Database Structure (Supabase)

### A. Tabel Utama

1.  **`caterings`**: Menyimpan data 4 katering (KPS, Berkah, dll).
2.  **`daily_menus`**: Jadwal makan (Pagi/Siang/Malam) per tanggal.
    - _Fitur Baru:_ `is_menu_compliant` untuk checklist manual "Kesesuaian Menu".
    - _Fitur Baru:_ `target_energy_kcal` (default 850) untuk acuan otomatis.
3.  **`dishes`**: Nama masakan dalam satu menu (e.g. "Nasi Putih", "Telur Balado").
4.  **`dish_ingredients`**: Inti perhitungan.
    - Ahli gizi input: `weight_cooked_g` (Berat Matang).
    - Pilih `processing_method_id` (Cara olah: Goreng, Rebus, dll).
    - Sistem hitung: Berat Mentah = Berat Matang \* Faktor Konversi.
5.  **`ingredients_library`**: Database bahan makanan (Data TKPI).
    - Lengkap dengan Data Makro (Energi, Protein, Lemak, KH) & Mikro (Vitamin, Mineral).
    - Kolom `code` dan `source` sesuai referensi buku.
6.  **`processing_methods`**: Master data faktor konversi (Mentah=1.0, Nasi=0.4, dll).

### B. Logic & Automation

Database menggunakan **View** (`view_menu_nutrition`) untuk otomatisasi:

- **Total Gizi**: Menjumlahkan seluruh kandungan gizi dari semua bahan dalam satu menu.
- **Status Kkal**: Otomatis bernilai `TRUE` jika Total Energi >= 850 kkal.

### C. Diagram

- **ERD**: Lihat file [ERD.md](./ERD.md) untuk struktur relasi.
- **Ilustrasi Data**: Lihat file [DATABASE_ILLUSTRATION.md](./DATABASE_ILLUSTRATION.md) untuk contoh kasus input Nasi & Telur.

---

## 3. Workflow Aplikasi

### Step 1: Input Jadwal & Menu

- User memilih Tanggal, Jam Makan (Malam), dan Katering (KPS).
- User menambah masakan: "Nasi Putih", "Ayam Goreng".

### Step 2: Detail Gramasi (Harian)

- User memilih bahan baku dari Library (Search by nama/kode).
- User memilih cara pengolahan (e.g. "Goreng").
- User memasukkan **Berat Matang** hasil penimbangan.
- _System_: Otomatis menghitung berat mentah & nilai gizi di background.

### Step 3: Validasi & Reporting

- **Checkbox Manual**: User mencentang "Menu Sesuai" jika komposisi menu wajar/sesuai kontrak.
- **Auto-Check Kkal**: Dashboard menampilkan status "Memenuhi Syarat" jika kalori > 850 kkal.
- **Laporan**:
  - Analisis Zat Gizi Makro & Mikro (PDF/View).
  - Grafik Kepatuhan per Bulan/Tahun.

---

## 4. Next Steps (Development Phase)

1.  **Tech Stack Setup**: React (Vite) + Tailwind CSS + Supabase.
2.  **UI Construction**:
    - Login Page.
    - Dashboard (Kalender Menu).
    - Form Input Menu (Dynamic Rows).
    - Report Viewer.
3.  **Deployment**: Vercel / Netlify.
