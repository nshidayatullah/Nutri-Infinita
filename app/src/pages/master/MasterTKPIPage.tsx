import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import * as XLSX from "xlsx";
import { ArrowDownTrayIcon, ArrowUpTrayIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

type Ingredient = {
  id: number;
  code: string | null;
  name: string;
  source: string | null;

  // Nilai Gizi per 100g BDD
  energy_kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  water_g: number;
  fiber_g: number;
  ash_g: number;
  calcium_mg: number;
  phosphorus_mg: number;
  iron_mg: number;
  sodium_mg: number;
  potassium_mg: number;
  copper_mg: number;
  zinc_mg: number;
  retinol_mcg: number;
  beta_carotene_mcg: number;
  total_carotene_mcg: number;
  thiamin_mg: number;
  riboflavin_mg: number;
  niacin_mg: number;
  vitamin_c_mg: number;

  default_bdd_percent: number;
};

type FormData = Omit<Ingredient, "id">;

const INITIAL_FORM_DATA: FormData = {
  code: "",
  name: "",
  source: "",
  energy_kcal: 0,
  protein_g: 0,
  fat_g: 0,
  carbs_g: 0,
  water_g: 0,
  fiber_g: 0,
  ash_g: 0,
  calcium_mg: 0,
  phosphorus_mg: 0,
  iron_mg: 0,
  sodium_mg: 0,
  potassium_mg: 0,
  copper_mg: 0,
  zinc_mg: 0,
  retinol_mcg: 0,
  beta_carotene_mcg: 0,
  total_carotene_mcg: 0,
  thiamin_mg: 0,
  riboflavin_mg: 0,
  niacin_mg: 0,
  vitamin_c_mg: 0,
  default_bdd_percent: 100,
};

export default function MasterTKPIPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetchIngredients();
  }, []);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  async function fetchIngredients() {
    setLoading(true);
    setError(null);
    try {
      let allData: Ingredient[] = [];
      let page = 0;
      const pageSize = 1000;

      while (true) {
        const { data, error } = await supabase
          .from("ingredients_library")
          .select("*")
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .order("name");

        if (error) throw error;

        if (!data || data.length === 0) break;

        allData = [...allData, ...data];

        // If we got fewer items than requested, we've reached the end
        if (data.length < pageSize) break;

        page++;
      }

      setIngredients(allData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingId(null);
    setFormData(INITIAL_FORM_DATA);
    setIsModalOpen(true);
  }

  function openEditModal(ingredient: Ingredient) {
    setEditingId(ingredient.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = ingredient;
    setFormData(rest);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editingId) {
        const { error } = await supabase.from("ingredients_library").update(formData).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ingredients_library").insert([formData]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchIngredients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  function confirmDelete(id: number, name: string) {
    setDeleteConfirm({ id, name });
  }

  async function handleDelete() {
    if (!deleteConfirm) return;

    try {
      const { error } = await supabase.from("ingredients_library").delete().eq("id", deleteConfirm.id);
      if (error) throw error;
      setDeleteConfirm(null);
      fetchIngredients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  // --- Import / Export Functions ---

  const handleExport = (type: "xlsx" | "csv") => {
    const dataToExport = ingredients.map((ing) => ({
      KODE: ing.code,
      "NAMA BAHAN": ing.name,
      SUMBER: ing.source,

      AIR: ing.water_g,
      ENERGI: ing.energy_kcal,
      PROTEIN: ing.protein_g,
      LEMAK: ing.fat_g,
      KH: ing.carbs_g,
      SERAT: ing.fiber_g,
      ABU: ing.ash_g,
      KALSIUM: ing.calcium_mg,
      FOSFOR: ing.phosphorus_mg,
      BESI: ing.iron_mg,
      NATRIUM: ing.sodium_mg,
      KALIUM: ing.potassium_mg,
      TEMBAGA: ing.copper_mg,
      SENG: ing.zinc_mg,
      RETINOL: ing.retinol_mcg,
      "B-KAR": ing.beta_carotene_mcg,
      "KAR-TOTAL": ing.total_carotene_mcg,
      THIAMIN: ing.thiamin_mg,
      RIBOFLAVIN: ing.riboflavin_mg,
      NIASIN: ing.niacin_mg,
      VIT_C: ing.vitamin_c_mg,
      "BDD (%)": ing.default_bdd_percent,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TKPI");

    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = `TKPI_Data_${dateStr}.${type}`;

    XLSX.writeFile(workbook, fileName);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = XLSX.utils.sheet_to_json<any>(ws);

        await processImportData(data);
      } catch (err) {
        console.error(err);
        setError("Gagal membaca file. Pastikan format Excel/CSV benar.");
      }
    };
    reader.readAsBinaryString(file);

    // Reset input value agar bisa upload file yang sama lagi jika perlu
    e.target.value = "";
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processImportData = async (importedData: any[]) => {
    if (importedData.length === 0) {
      setError("File kosong atau tidak ada data yang terbaca.");
      return;
    }

    setLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ingredientsToInsert = importedData.map((row: any) => ({
        code: row.code || row.Code || row.KODE || null,
        name: row.name || row.Name || row.NAMA || row["NAMA BAHAN"] || "Unknown",
        source: row.source || row.Source || row.SUMBER || null,

        water_g: Number(row.water_g || row.WATER_G || row.AIR || 0),
        energy_kcal: Number(row.energy_kcal || row.ENERGY_KCAL || row.ENERGI || 0),
        protein_g: Number(row.protein_g || row.PROTEIN_G || row.PROTEIN || 0),
        fat_g: Number(row.fat_g || row.FAT_G || row.LEMAK || 0),
        carbs_g: Number(row.carbs_g || row.CARBS_G || row.KH || 0),
        fiber_g: Number(row.fiber_g || row.FIBER_G || row.SERAT || 0),
        ash_g: Number(row.ash_g || row.ASH_G || row.ABU || 0),
        calcium_mg: Number(row.calcium_mg || row.KALSIUM || 0),
        phosphorus_mg: Number(row.phosphorus_mg || row.FOSFOR || 0),
        iron_mg: Number(row.iron_mg || row.BESI || 0),
        sodium_mg: Number(row.sodium_mg || row.NATRIUM || 0),
        potassium_mg: Number(row.potassium_mg || row.KALIUM || 0),
        copper_mg: Number(row.copper_mg || row.TEMBAGA || 0),
        zinc_mg: Number(row.zinc_mg || row.SENG || 0),
        retinol_mcg: Number(row.retinol_mcg || row.RETINOL || 0),
        beta_carotene_mcg: Number(row.beta_carotene_mcg || row["B-KAR"] || 0),
        total_carotene_mcg: Number(row.total_carotene_mcg || row["KAR-TOTAL"] || 0),
        thiamin_mg: Number(row.thiamin_mg || row.THIAMIN || 0),
        riboflavin_mg: Number(row.riboflavin_mg || row.RIBOFLAVIN || 0),
        niacin_mg: Number(row.niacin_mg || row.NIASIN || 0),
        vitamin_c_mg: Number(row.vitamin_c_mg || row.VIT_C || 0),
        default_bdd_percent: Number(row.default_bdd_percent || row.BDD || row["BDD (%)"] || 100),
      }));

      // Batch Insert Process to handle large datasets
      const BATCH_SIZE = 100;
      const totalBatches = Math.ceil(ingredientsToInsert.length / BATCH_SIZE);
      let successCount = 0;

      for (let i = 0; i < ingredientsToInsert.length; i += BATCH_SIZE) {
        const batch = ingredientsToInsert.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from("ingredients_library").insert(batch);

        if (error) {
          console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
          throw error;
        }
        successCount += batch.length;
      }

      alert(`Berhasil import ${successCount} data bahan makanan dalam ${totalBatches} batch!`);
      fetchIngredients();
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError("Gagal import data: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete All Data Function
  const handleDeleteAll = async () => {
    if (!window.confirm("PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA TKPI?\n\nTindakan ini akan mengosongkan seluruh perpustakaan bahan makanan dan tidak dapat dibatalkan!")) {
      return;
    }

    // Double confirmation for safety
    if (!window.confirm("KONFIRMASI TERAKHIR: Anda benar-benar ingin menghapus semua data?")) {
      return;
    }

    setLoading(true);
    try {
      // Delete all rows where id is not -1 (effectively all rows)
      const { error } = await supabase.from("ingredients_library").delete().neq("id", -1);

      if (error) throw error;

      alert("Semua data berhasil dihapus.");
      fetchIngredients(); // Refresh empty list
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError("Gagal menghapus data: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredIngredients = ingredients.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())));

  // Pagination Logic
  const totalItems = filteredIngredients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedIngredients = filteredIngredients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Cari bahan makanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        {/* Import / Export Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDeleteAll}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors mr-2"
            title="Hapus Semua Data"
          >
            <TrashIcon className="h-4 w-4" />
            Reset Data
          </button>

          <button
            onClick={() => handleExport("xlsx")}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            title="Export ke Excel"
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            Export
          </button>

          <div className="relative">
            <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Import dari Excel/CSV" />
            <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors pointer-events-none">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Import
            </button>
          </div>
        </div>

        <button onClick={openAddModal} className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-colors">
          + Tambah Bahan
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col h-[75vh]">
        <div className="flex-1 overflow-auto relative">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="sticky top-0 z-30 shadow-lg">
              {/* Group Headers */}
              <tr className="border-b border-gray-700">
                <th colSpan={3} className="sticky left-0 z-40 bg-gray-900 px-3 py-2 text-center text-xs font-bold text-green-400 border-b border-b-gray-700 border-r-2 border-r-white/20">
                  📋 Informasi Bahan
                </th>
                <th colSpan={7} className="px-3 py-2 text-center text-xs font-bold text-blue-400 border-b border-b-gray-700 border-r border-r-white/10 bg-gray-900">
                  🥗 Nutrisi Makro
                </th>
                <th colSpan={7} className="px-3 py-2 text-center text-xs font-bold text-orange-400 border-b border-b-gray-700 border-r border-r-white/10 bg-gray-900">
                  ⚗️ Mineral
                </th>
                <th colSpan={7} className="px-3 py-2 text-center text-xs font-bold text-yellow-400 border-b border-b-gray-700 border-r border-r-white/10 bg-gray-900">
                  💊 Vitamin
                </th>
                <th rowSpan={2} className="px-3 py-2 text-center text-xs font-bold text-purple-400 border-b border-b-gray-700 border-r border-r-white/10 bg-gray-900">
                  BDD
                  <br />
                  (%)
                </th>
                <th rowSpan={2} className="px-3 py-2 text-center text-xs font-bold text-gray-400 border-b border-b-gray-700 bg-gray-900">
                  Aksi
                </th>
              </tr>

              {/* Column Headers */}
              <tr className="bg-gray-800 text-gray-300">
                <th className="sticky left-0 z-40 bg-gray-900 border-r border-white/10 border-b border-gray-700 px-3 py-2 font-medium w-[80px] min-w-[80px]">Kode</th>
                <th className="sticky left-[80px] z-40 bg-gray-900 border-r border-white/10 border-b border-gray-700 px-3 py-2 font-medium w-[256px] min-w-[256px]">Nama Bahan</th>
                <th className="sticky left-[336px] z-40 bg-gray-900 border-r-2 border-white/20 border-b border-gray-700 px-3 py-2 font-medium w-[128px] min-w-[128px]">Sumber</th>

                <th className="px-3 py-2 font-medium text-blue-300 bg-blue-500/5 border-b border-gray-700 text-right">
                  Air
                  <br />
                  (g)
                </th>
                <th className="px-3 py-2 font-medium text-blue-300 bg-blue-500/5 border-b border-gray-700 text-right">
                  Energi
                  <br />
                  (kal)
                </th>
                <th className="px-3 py-2 font-medium text-blue-300 bg-blue-500/5 border-b border-gray-700 text-right">
                  Prot
                  <br />
                  (g)
                </th>
                <th className="px-3 py-2 font-medium text-blue-300 bg-blue-500/5 border-b border-gray-700 text-right">
                  Lemak
                  <br />
                  (g)
                </th>
                <th className="px-3 py-2 font-medium text-blue-300 bg-blue-500/5 border-b border-gray-700 text-right">
                  KH
                  <br />
                  (g)
                </th>
                <th className="px-3 py-2 font-medium text-blue-300 bg-blue-500/5 border-b border-gray-700 text-right">
                  Serat
                  <br />
                  (g)
                </th>
                <th className="px-3 py-2 font-medium text-blue-300 bg-blue-500/5 border-b border-gray-700 text-right">
                  Abu
                  <br />
                  (g)
                </th>

                <th className="px-3 py-2 font-medium text-orange-300 bg-orange-500/5 border-b border-gray-700 text-right">
                  Kal
                  <br />
                  (mg)
                </th>
                <th className="px-3 py-2 font-medium text-orange-300 bg-orange-500/5 border-b border-gray-700 text-right">
                  Fos
                  <br />
                  (mg)
                </th>
                <th className="px-3 py-2 font-medium text-orange-300 bg-orange-500/5 border-b border-gray-700 text-right">
                  Besi
                  <br />
                  (mg)
                </th>
                <th className="px-3 py-2 font-medium text-orange-300 bg-orange-500/5 border-b border-gray-700 text-right">
                  Nat
                  <br />
                  (mg)
                </th>
                <th className="px-3 py-2 font-medium text-orange-300 bg-orange-500/5 border-b border-gray-700 text-right">
                  Kalium
                  <br />
                  (mg)
                </th>
                <th className="px-3 py-2 font-medium text-orange-300 bg-orange-500/5 border-b border-gray-700 text-right">
                  Tem
                  <br />
                  (mg)
                </th>
                <th className="px-3 py-2 font-medium text-orange-300 bg-orange-500/5 border-b border-gray-700 text-right">
                  Seng
                  <br />
                  (mg)
                </th>

                <th className="px-3 py-2 font-medium text-yellow-300 bg-yellow-500/5 border-b border-gray-700 text-right">
                  Ret
                  <br />
                  (mcg)
                </th>
                <th className="px-3 py-2 font-medium text-yellow-300 bg-yellow-500/5 border-b border-gray-700 text-right">
                  B-Kar
                  <br />
                  (mcg)
                </th>
                <th className="px-3 py-2 font-medium text-yellow-300 bg-yellow-500/5 border-b border-gray-700 text-right">
                  Kar-Tot
                  <br />
                  (mcg)
                </th>
                <th className="px-3 py-2 font-medium text-yellow-300 bg-yellow-500/5 border-b border-gray-700 text-right">
                  Thia
                  <br />
                  (mg)
                </th>
                <th className="px-3 py-2 font-medium text-yellow-300 bg-yellow-500/5 border-b border-gray-700 text-right">
                  Ribo
                  <br />
                  (mg)
                </th>
                <th className="px-3 py-2 font-medium text-yellow-300 bg-yellow-500/5 border-b border-gray-700 text-right">
                  Nia
                  <br />
                  (mg)
                </th>
                <th className="px-3 py-2 font-medium text-yellow-300 bg-yellow-500/5 border-b border-gray-700 text-right">
                  Vit-C
                  <br />
                  (mg)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedIngredients.length === 0 ? (
                <tr>
                  <td colSpan={26} className="px-6 py-12 text-center text-gray-400">
                    {searchQuery ? "Tidak ditemukan" : "Belum ada data"}
                  </td>
                </tr>
              ) : (
                paginatedIngredients.map((ing) => (
                  <tr key={ing.id} className="hover:bg-white/5 transition-colors group">
                    <td className="sticky left-0 z-20 bg-gray-900 border-r border-white/10 px-3 py-2 text-green-400/70 font-mono w-[80px] min-w-[80px]">{ing.code || "-"}</td>
                    <td className="sticky left-[80px] z-20 bg-gray-900 border-r border-white/10 px-3 py-2 text-white font-medium w-[256px] min-w-[256px] truncate" title={ing.name}>
                      {ing.name}
                    </td>
                    <td className="sticky left-[336px] z-20 bg-gray-900 border-r-2 border-white/20 px-3 py-2 text-gray-400 w-[128px] min-w-[128px] truncate" title={ing.source || ""}>
                      {ing.source || "-"}
                    </td>

                    <td className="px-3 py-2 text-blue-100 bg-blue-500/5 text-right tabular-nums">{ing.water_g}</td>
                    <td className="px-3 py-2 text-blue-100 bg-blue-500/5 text-right tabular-nums font-bold">{ing.energy_kcal}</td>
                    <td className="px-3 py-2 text-blue-100 bg-blue-500/5 text-right tabular-nums">{ing.protein_g}</td>
                    <td className="px-3 py-2 text-blue-100 bg-blue-500/5 text-right tabular-nums">{ing.fat_g}</td>
                    <td className="px-3 py-2 text-blue-100 bg-blue-500/5 text-right tabular-nums">{ing.carbs_g}</td>
                    <td className="px-3 py-2 text-blue-100 bg-blue-500/5 text-right tabular-nums">{ing.fiber_g}</td>
                    <td className="px-3 py-2 text-blue-100 bg-blue-500/5 text-right tabular-nums">{ing.ash_g}</td>

                    <td className="px-3 py-2 text-orange-100 bg-orange-500/5 text-right tabular-nums">{ing.calcium_mg}</td>
                    <td className="px-3 py-2 text-orange-100 bg-orange-500/5 text-right tabular-nums">{ing.phosphorus_mg}</td>
                    <td className="px-3 py-2 text-orange-100 bg-orange-500/5 text-right tabular-nums">{ing.iron_mg}</td>
                    <td className="px-3 py-2 text-orange-100 bg-orange-500/5 text-right tabular-nums">{ing.sodium_mg}</td>
                    <td className="px-3 py-2 text-orange-100 bg-orange-500/5 text-right tabular-nums">{ing.potassium_mg}</td>
                    <td className="px-3 py-2 text-orange-100 bg-orange-500/5 text-right tabular-nums">{ing.copper_mg}</td>
                    <td className="px-3 py-2 text-orange-100 bg-orange-500/5 text-right tabular-nums">{ing.zinc_mg}</td>

                    <td className="px-3 py-2 text-yellow-100 bg-yellow-500/5 text-right tabular-nums">{ing.retinol_mcg}</td>
                    <td className="px-3 py-2 text-yellow-100 bg-yellow-500/5 text-right tabular-nums">{ing.beta_carotene_mcg}</td>
                    <td className="px-3 py-2 text-yellow-100 bg-yellow-500/5 text-right tabular-nums">{ing.total_carotene_mcg}</td>
                    <td className="px-3 py-2 text-yellow-100 bg-yellow-500/5 text-right tabular-nums">{ing.thiamin_mg}</td>
                    <td className="px-3 py-2 text-yellow-100 bg-yellow-500/5 text-right tabular-nums">{ing.riboflavin_mg}</td>
                    <td className="px-3 py-2 text-yellow-100 bg-yellow-500/5 text-right tabular-nums">{ing.niacin_mg}</td>
                    <td className="px-3 py-2 text-yellow-100 bg-yellow-500/5 text-right tabular-nums">{ing.vitamin_c_mg}</td>
                    <td className="px-3 py-2 text-purple-400 font-semibold text-right tabular-nums bg-purple-500/10 border-l border-white/5">{ing.default_bdd_percent}</td>

                    <td className="px-3 py-2">
                      <div className="flex gap-2 whitespace-nowrap">
                        <button onClick={() => openEditModal(ing)} className="text-yellow-400 hover:text-yellow-300 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => confirmDelete(ing.id, ing.name)} className="text-red-400 hover:text-red-300 transition-colors">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm bg-gray-900/50 rounded-b-xl">
          <div className="text-gray-400">
            Menampilkan <span className="text-white font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-white font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> dari{" "}
            <span className="text-white font-medium">{totalItems}</span> data
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevPage} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors">
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="text-gray-400">
              Halaman <span className="text-white font-medium">{currentPage}</span> / {Math.max(1, totalPages)}
            </span>
            <button onClick={nextPage} disabled={currentPage >= totalPages || totalPages === 0} className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors">
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && <FormModal editingId={editingId} formData={formData} setFormData={setFormData} onSubmit={handleSubmit} onClose={() => setIsModalOpen(false)} submitting={submitting} />}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-gray-900 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">Hapus Bahan Makanan?</h3>
            <p className="text-gray-400 mb-6">
              Apakah Anda yakin ingin menghapus <strong>{deleteConfirm.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors">
                Batal
              </button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Form Modal
function FormModal({
  editingId,
  formData,
  setFormData,
  onSubmit,
  onClose,
  submitting,
}: {
  editingId: number | null;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  submitting: boolean;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Handle numeric fields
    const isNumeric = [
      "energy_kcal",
      "protein_g",
      "fat_g",
      "carbs_g",
      "water_g",
      "fiber_g",
      "ash_g",
      "calcium_mg",
      "phosphorus_mg",
      "iron_mg",
      "sodium_mg",
      "potassium_mg",
      "copper_mg",
      "zinc_mg",
      "retinol_mcg",
      "beta_carotene_mcg",
      "total_carotene_mcg",
      "thiamin_mg",
      "riboflavin_mg",
      "niacin_mg",
      "vitamin_c_mg",
      "default_bdd_percent",
    ].includes(name);

    setFormData((prev) => ({
      ...prev,
      [name]: isNumeric ? (value === "" ? 0 : parseFloat(value)) : value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 bg-gray-900 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{editingId ? "Edit Bahan Makanan" : "Tambah Bahan Makanan"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Section 1: Info Dasar */}
          <div>
            <h4 className="text-sm font-bold text-green-400 mb-4 border-b border-white/10 pb-2">📋 Informasi Dasar</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Kode Bahan</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-gray-800 border border-white/10 px-3 py-2 text-white focus:border-green-500 outline-none"
                  placeholder="Contoh: AR001"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Nama Bahan *</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-gray-800 border border-white/10 px-3 py-2 text-white focus:border-green-500 outline-none"
                  placeholder="Nama bahan makanan"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Sumber Data</label>
                <input
                  type="text"
                  name="source"
                  value={formData.source || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-gray-800 border border-white/10 px-3 py-2 text-white focus:border-green-500 outline-none"
                  placeholder="Contoh: TKPI 2019"
                />
              </div>
              <div>
                <label className="block text-xs text-purple-400 mb-1 font-bold">BDD (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="default_bdd_percent"
                  value={formData.default_bdd_percent}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-gray-800 border border-purple-500/30 px-3 py-2 text-white focus:border-purple-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Makro */}
          <div>
            <h4 className="text-sm font-bold text-blue-400 mb-4 border-b border-white/10 pb-2">🥗 Nutrisi Makro (per 100g BDD)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InputNumber label="Energi (kcal)" name="energy_kcal" value={formData.energy_kcal} onChange={handleChange} />
              <InputNumber label="Protein (g)" name="protein_g" value={formData.protein_g} onChange={handleChange} />
              <InputNumber label="Lemak (g)" name="fat_g" value={formData.fat_g} onChange={handleChange} />
              <InputNumber label="Karbohidrat (g)" name="carbs_g" value={formData.carbs_g} onChange={handleChange} />
              <InputNumber label="Air (g)" name="water_g" value={formData.water_g} onChange={handleChange} />
              <InputNumber label="Serat (g)" name="fiber_g" value={formData.fiber_g} onChange={handleChange} />
              <InputNumber label="Abu (g)" name="ash_g" value={formData.ash_g} onChange={handleChange} />
            </div>
          </div>

          {/* Section 3: Mineral */}
          <div>
            <h4 className="text-sm font-bold text-orange-400 mb-4 border-b border-white/10 pb-2">⚗️ Mineral (mg)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InputNumber label="Kalsium" name="calcium_mg" value={formData.calcium_mg} onChange={handleChange} />
              <InputNumber label="Fosfor" name="phosphorus_mg" value={formData.phosphorus_mg} onChange={handleChange} />
              <InputNumber label="Besi" name="iron_mg" value={formData.iron_mg} onChange={handleChange} />
              <InputNumber label="Natrium" name="sodium_mg" value={formData.sodium_mg} onChange={handleChange} />
              <InputNumber label="Kalium" name="potassium_mg" value={formData.potassium_mg} onChange={handleChange} />
              <InputNumber label="Tembaga" name="copper_mg" value={formData.copper_mg} onChange={handleChange} />
              <InputNumber label="Seng" name="zinc_mg" value={formData.zinc_mg} onChange={handleChange} />
            </div>
          </div>

          {/* Section 4: Vitamin */}
          <div>
            <h4 className="text-sm font-bold text-yellow-400 mb-4 border-b border-white/10 pb-2">💊 Vitamin</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InputNumber label="Retinol (mcg)" name="retinol_mcg" value={formData.retinol_mcg} onChange={handleChange} />
              <InputNumber label="B-Karoten (mcg)" name="beta_carotene_mcg" value={formData.beta_carotene_mcg} onChange={handleChange} />
              <InputNumber label="Total Karoten (mcg)" name="total_carotene_mcg" value={formData.total_carotene_mcg} onChange={handleChange} />
              <InputNumber label="Thiamin (mg)" name="thiamin_mg" value={formData.thiamin_mg} onChange={handleChange} />
              <InputNumber label="Riboflavin (mg)" name="riboflavin_mg" value={formData.riboflavin_mg} onChange={handleChange} />
              <InputNumber label="Niasin (mg)" name="niacin_mg" value={formData.niacin_mg} onChange={handleChange} />
              <InputNumber label="Vitamin C (mg)" name="vitamin_c_mg" value={formData.vitamin_c_mg} onChange={handleChange} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={submitting} className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors disabled:opacity-50">
              {submitting ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputNumber({ label, name, value, onChange }: { label: string; name: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input type="number" step="0.1" name={name} value={value} onChange={onChange} className="w-full rounded-lg bg-gray-800 border border-white/10 px-3 py-2 text-white focus:border-blue-500 outline-none" />
    </div>
  );
}
