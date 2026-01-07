# Implementation Plan - Catering Nutrition App

## 1. Technology Stack

- **Framework**: React (Vite) + Typescript
- **Styling**: Tailwind CSS (Shadcn/UI components)
- **Database & Auth**: Supabase
- **Graphs/Charts**: Recharts
- **PDF Export**: React-PDF or html2canvas + jspdf

## 2. Updated Database Considerations

Based on final user requirements:

1.  **Custom Ingredients**: Users can add new rows to `ingredients_library` with `source='User Custom'`.
2.  **Reporting**:
    - Metrics calculation: `(Total Compliant Menus / Total Menus Inputted) * 100`.
    - Days with no input/orders are excluded from the denominator.
    - Detail view showing list of `daily_menus` where `is_target_met_auto = false` OR `is_menu_compliant = false`.

## 3. Step-by-Step Implementation

### Phase 1: Project Setup & Foundation

- [ ] Initialize Vite React Project (`npm create vite@latest`).
- [ ] Install Tailwind CSS & Shadcn/UI (Button, Input, Table, Card, Select, etc.).
- [ ] Setup Supabase Client (Environment Variables).
- [ ] **Validation**: Verify project runs locally and connects to Supabase.

### Phase 2: Master Data Management (CRUD)

- [ ] **Ingredients Page**:
  - Table view of TKPI data (Search, Filter by Category).
  - "Add Custom Ingredient" Modal (Input all macro/micro nutrients).
  - Edit/Delete capabilities.
- [ ] **Catering & Processing Methods**:
  - Simple CRUD pages for `caterings` and `processing_methods`.

### Phase 3: Daily Menu Planning (Core Feature)

- [ ] **Menu Dashboard**:
  - Select Date, Meal Time, Catering.
  - Check if menu exists? Load it. If not? Create new.
- [ ] **Dish & Ingredient Editor**:
  - Add "Dish" (e.g. "Soto Ayam").
  - For each Dish, add "Ingredients":
    - Combobox to search `ingredients_library`.
    - Dropdown for `processing_methods` (Goreng, Rebus, etc.).
    - Input `weight_cooked_g`.
    - _Real-time_: Display calculated `weight_raw_net_g`.
- [ ] **Nutrition Summary Sidebar**:
  - Show running total of Energy vs Target (850).
  - Checkbox "Menu Sesuai" (Manual Compliance).

### Phase 4: Analytics & Reporting

- [ ] **Dashboard Analytics**:
  - Card: Total Compliance Rate (Year/Month).
  - Chart: Compliance Trend per Catering.
- [ ] **Detail Report Page**:
  - Filter by Month/Year & Catering.
  - Table showing **only** non-compliant dates (Red list).
- [ ] **PDF Export**:
  - Generate "Analisis Nilai Gizi" document matching the user's reference image.

## 4. Folder Structure

```
src/
  components/
    ui/           # Shadcn components
    layout/       # Sidebar, Header
    nutrition/    # Specific components like IngredientSearch
  pages/
    dashboard/    # Analytics
    planning/     # Menu Input
    master/       # Ingredients, Caterings
    reports/      # Detailed logs
  lib/
    supabase.ts   # Client
    utils.ts      # Helper functions (formulas)
  hooks/          # React Query / Custom hooks
```
