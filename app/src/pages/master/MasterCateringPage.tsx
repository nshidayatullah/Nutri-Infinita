import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

type Catering = {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
};

type FormData = {
  name: string;
  contact_person: string;
  phone: string;
  is_active: boolean;
};

export default function MasterCateringPage() {
  const [caterings, setCaterings] = useState<Catering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    contact_person: "",
    phone: "",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    fetchCaterings();
  }, []);

  async function fetchCaterings() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("caterings").select("*").order("created_at", { ascending: false });

      if (error) throw error;
      setCaterings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingId(null);
    setFormData({ name: "", contact_person: "", phone: "", is_active: true });
    setIsModalOpen(true);
  }

  function openEditModal(catering: Catering) {
    setEditingId(catering.id);
    setFormData({
      name: catering.name || "",
      contact_person: catering.contact_person || "",
      phone: catering.phone || "",
      is_active: catering.is_active ?? true,
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editingId) {
        // Update
        const { error } = await supabase.from("caterings").update(formData).eq("id", editingId);

        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase.from("caterings").insert([formData]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchCaterings();
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
      const { error } = await supabase.from("caterings").delete().eq("id", deleteConfirm.id);
      if (error) throw error;
      setDeleteConfirm(null);
      fetchCaterings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-50 dark:bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Catering</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola data penyedia catering</p>
        </div>
        <button onClick={openAddModal} className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-colors">
          + Tambah Catering
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Catering</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Person</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Telepon</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
              {caterings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Belum ada data catering. Klik "Tambah Catering" untuk mulai.
                  </td>
                </tr>
              ) : (
                caterings.map((catering) => (
                  <tr key={catering.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{catering.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{catering.contact_person || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{catering.phone || "-"}</td>
                    <td className="px-6 py-4 text-sm">
                      {catering.is_active ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">Aktif</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-500/20 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-400">Nonaktif</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-4">
                        <button onClick={() => openEditModal(catering)} className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors font-medium">
                          Edit
                        </button>
                        <button onClick={() => confirmDelete(catering.id, catering.name)} className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors font-medium">
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
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-sm p-4 shadow-sm">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total: <span className="font-semibold text-gray-900 dark:text-white">{caterings.length}</span> catering terdaftar
        </p>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{editingId ? "Edit Catering" : "Tambah Catering"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nama Catering <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Masukkan nama catering"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Nama PIC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telepon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="08123456789"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">
                  Aktif
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 transition-colors disabled:opacity-50">
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Hapus Catering"
        message={`Yakin ingin menghapus catering "${deleteConfirm?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        isDestructive={true}
      />
    </div>
  );
}
