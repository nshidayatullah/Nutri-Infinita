# Ilustrasi Data Tabel Database

Berikut adalah gambaran bagaimana data tersimpan di dalam tabel berdasarkan kasus penggunaan: **Menu Makan Malam KPS - Sabtu, 3 Januari 2026**.

## 1. Tabel Master

### Tabel `caterings`

| id  | name            | contact_person | phone       |
| :-- | :-------------- | :------------- | :---------- |
| 1   | **KPS**         | Budi           | 08123456789 |
| 2   | Berkah Catering | Siti           | 08129...    |

### Tabel `processing_methods`

| id  | name         | conversion_factor | Note                                    |
| :-- | :----------- | :---------------- | :-------------------------------------- |
| 1   | Mentah       | 1.0               | Tidak berubah                           |
| 2   | Nasi         | **0.4**           | Nasi 100g = Beras mentah 40g (Estimasi) |
| 3   | Telur Ceplok | 0.9               | Menyusut sedikit                        |
| 4   | Rebus        | 1.0               | Tetap                                   |

### Tabel `ingredients_library` (Data TKPI)

| id  | code  | name               | category | bdd\_% | energy | protein | ... |
| :-- | :---- | :----------------- | :------- | :----- | :----- | :------ | :-- |
| 101 | AR001 | **Beras Giling**   | Serealia | 100    | 357    | 8.4     | ... |
| 102 | -     | **Telur ayam ras** | Lauk     | 90     | 150    | 12.0    | ... |
| 103 | -     | **Minyak Sawit**   | Lemak    | 100    | 884    | 0       | ... |

---

## 2. Tabel Transaksi (Input Menu)

### Tabel `daily_menus`

| id  | catering_id | menu_date  | meal_time | target_kcal |
| :-- | :---------- | :--------- | :-------- | :---------- |
| 501 | 1 (KPS)     | 2026-01-03 | **Malam** | 850         |

### Tabel `dishes`

| id  | daily_menu_id | name                    |
| :-- | :------------ | :---------------------- |
| 601 | 501           | **Nasi Putih**          |
| 602 | 501           | **Telur Ceplok Balado** |
| 603 | 501           | **Tempe Goreng**        |

### Tabel `dish_ingredients` (DETAIL PERHITUNGAN)

Di sinilah "Magic" konversi terjadi.
_Rumus: Berat Mentah Bersih = (Berat Matang _ FK Masak) _ (BDD / 100)_

**Dish: Nasi Putih (id: 601)**
| id | dish_id | ingredient_id | method_id | Berat Matang | FK Masak | BDD % | **Berat Mentah (Net)** |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 701 | 601 | 101 (Beras) | 2 (Nasi) | **274 g** | 0.4 | 100 | **109.6 g** |
_(Perhitungan: 274 _ 0.4 _ 1.0 = 109.6 g Beras Mentah)_

**Dish: Telur Ceplok Balado (id: 602)**
| id | dish_id | ingredient_id | method_id | Berat Matang | FK Masak | BDD % | **Berat Mentah (Net)** |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 702 | 602 | 102 (Telur) | 3 (Ceplok) | **41 g** | 0.9 | 90 | approx **33.2 g** |
| 703 | 602 | 103 (Minyak) | 1 (Mentah)| **5 g** | 1.0 | 100 | **5 g** |

---

## 3. Hasil Akhir (View Report)

### View `view_menu_nutrition`

Otomatis menjumlahkan gizi dari `Berat Mentah (Net)` di atas dikali data `ingredients_library`.

| menu_date  | catering | time  | Total Energi   | Target | Status |
| :--------- | :------- | :---- | :------------- | :----- | :----- |
| 2026-01-03 | KPS      | Malam | **870.1 kkal** | 850    | **OK** |
