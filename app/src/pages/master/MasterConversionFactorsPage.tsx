import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { MagnifyingGlassIcon, ArrowPathIcon, PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

// Tipe data sesuai schema database
type ConversionFactor = {
  id: number;
  food_name: string;
  conversion_factor: number;
  bdd_percent: number;
};

export default function MasterConversionFactorsPage() {
  const [data, setData] = useState<ConversionFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConversionFactor | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    food_name: "",
    conversion_factor: "",
    bdd_percent: "",
  });

  // Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: factors, error } = await supabase.from("conversion_factors").select("*").order("food_name", { ascending: true });

      if (error) throw error;
      setData(factors || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter Data
  const filteredData = data.filter((item) => item.food_name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Handle Submit (Create/Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      food_name: formData.food_name,
      conversion_factor: parseFloat(formData.conversion_factor),
      bdd_percent: parseFloat(formData.bdd_percent),
    };

    try {
      if (editingItem) {
        // Update
        const { error } = await supabase.from("conversion_factors").update(payload).eq("id", editingItem.id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase.from("conversion_factors").insert([payload]);
        if (error) throw error;
      }

      // Reset & Refresh
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ food_name: "", conversion_factor: "", bdd_percent: "" });
      fetchData();
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Gagal menyimpan data. Pastikan tabel 'conversion_factors' sudah dibuat di database.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Click
  const handleEdit = (item: ConversionFactor) => {
    setEditingItem(item);
    setFormData({
      food_name: item.food_name,
      conversion_factor: item.conversion_factor.toString(),
      bdd_percent: item.bdd_percent.toString(),
    });
    setIsModalOpen(true);
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const { error } = await supabase.from("conversion_factors").delete().eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("Gagal menghapus data.");
    }
  };

  // Handle Open Modal (New)
  const openNewModal = () => {
    setEditingItem(null);
    setFormData({ food_name: "", conversion_factor: "1.0", bdd_percent: "100" });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Faktor Konversi (Mentah / Matang)</h2>
          <p className="text-sm text-gray-400">Kelola data konversi berat bahan makanan mentah ke matang</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-white transition-colors" title="Refresh Data">
            <ArrowPathIcon className="h-5 w-5" />
          </button>
          <button onClick={openNewModal} className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors">
            <PlusIcon className="h-4 w-4" />
            Tambah Data
          </button>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between rounded-xl bg-white/5 p-4 border border-white/10 backdrop-blur-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari bahan makanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/20 pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span>
              Total: <span className="text-white font-medium">{filteredData.length}</span> item
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-gray-400">
                <th className="px-6 py-4 font-medium">No</th>
                <th className="px-6 py-4 font-medium">Bahan Makanan (Matang)</th>
                <th className="px-6 py-4 font-medium text-center">
                  Faktor Konversi
                  <br />
                  <span className="text-xs text-gray-500">(Mentah/Matang)</span>
                </th>
                <th className="px-6 py-4 font-medium text-center">
                  BDD (%)
                  <br />
                  <span className="text-xs text-gray-500">(Berat Dapat Dimakan)</span>
                </th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data ditemukan
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-gray-500 w-16">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-white">{item.food_name}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          item.conversion_factor > 1 ? "bg-yellow-400/10 text-yellow-400 ring-yellow-400/20" : "bg-blue-400/10 text-blue-400 ring-blue-400/20"
                        }`}
                      >
                        {item.conversion_factor}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-300">{item.bdd_percent}%</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors" title="Edit">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Hapus">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#1A1A1A] p-6 shadow-2xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">{editingItem ? "Edit Faktor Konversi" : "Tambah Faktor Konversi"}</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nama Bahan Makanan (Matang)</label>
                <input
                  type="text"
                  required
                  value={formData.food_name}
                  onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-green-500 focus:outline-none transition-colors"
                  placeholder="Contoh: Ayam Goreng"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Faktor Konversi</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.conversion_factor}
                    onChange={(e) => setFormData({ ...formData, conversion_factor: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="1.0"
                  />
                  <p className="mt-1 text-xs text-gray-500">Mentah / Matang</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">BDD (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    required
                    value={formData.bdd_percent}
                    onChange={(e) => setFormData({ ...formData, bdd_percent: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="100"
                  />
                  <p className="mt-1 text-xs text-gray-500">Berat Dapat Dimakan</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors disabled:opacity-50">
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
