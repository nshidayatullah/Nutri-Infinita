import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { PlusIcon, TrashIcon, PencilIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";

type MealType = {
  id: number;
  name: string;
  emoji: string;
  sort_order: number;
};

export default function MasterMealTimePage() {
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<MealType>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", emoji: "🍽️", sort_order: 0 });

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase.from("meal_types").select("*").order("sort_order");
    if (error) console.error(error);
    if (data) setMealTypes(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus waktu makan ini?")) return;
    const { error } = await supabase.from("meal_types").delete().eq("id", id);
    if (!error) fetchData();
    else alert("Gagal menghapus.");
  };

  const handleEdit = (item: MealType) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("meal_types").update(editForm).eq("id", editingId);
    if (!error) {
      setEditingId(null);
      fetchData();
    } else {
      alert("Gagal update.");
    }
  };

  const handleAdd = async () => {
    if (!addForm.name) return;
    const { error } = await supabase.from("meal_types").insert([addForm]);
    if (!error) {
      setIsAdding(false);
      setAddForm({ name: "", emoji: "🍽️", sort_order: mealTypes.length + 1 });
      fetchData();
    } else {
      alert("Gagal menambah.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Master Waktu Makan</h2>
          <p className="text-gray-500 text-sm">Kelola daftar waktu makan (Shift)</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors">
            <PlusIcon className="w-5 h-5" /> Tambah Baru
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="p-4 w-10 text-center">Icon</th>
              <th className="p-4">Nama Waktu</th>
              <th className="p-4 w-20 text-center">Urutan</th>
              <th className="p-4 w-32 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/5">
            {isAdding && (
              <tr className="bg-green-50 dark:bg-green-900/10">
                <td className="p-4">
                  <input type="text" value={addForm.emoji} onChange={(e) => setAddForm({ ...addForm, emoji: e.target.value })} className="w-10 text-center bg-white dark:bg-gray-700 border rounded p-1" />
                </td>
                <td className="p-4">
                  <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="Contoh: Snack Malam" className="w-full bg-white dark:bg-gray-700 border rounded p-2" autoFocus />
                </td>
                <td className="p-4">
                  <input type="number" value={addForm.sort_order} onChange={(e) => setAddForm({ ...addForm, sort_order: Number(e.target.value) })} className="w-full text-center bg-white dark:bg-gray-700 border rounded p-2" />
                </td>
                <td className="p-4 flex gap-2 justify-center">
                  <button onClick={handleAdd} className="p-2 bg-green-600 text-white rounded hover:bg-green-500">
                    <CheckIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsAdding(false)} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-400">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )}

            {mealTypes.map((item) => (
              <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-white/5">
                {editingId === item.id ? (
                  <>
                    <td className="p-4">
                      <input type="text" value={editForm.emoji} onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })} className="w-10 text-center bg-white dark:bg-gray-700 border rounded p-1" />
                    </td>
                    <td className="p-4">
                      <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-white dark:bg-gray-700 border rounded p-2" />
                    </td>
                    <td className="p-4">
                      <input type="number" value={editForm.sort_order} onChange={(e) => setEditForm({ ...editForm, sort_order: Number(e.target.value) })} className="w-full text-center bg-white dark:bg-gray-700 border rounded p-2" />
                    </td>
                    <td className="p-4 flex gap-2 justify-center">
                      <button onClick={saveEdit} className="p-2 bg-green-600 text-white rounded hover:bg-green-500">
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-400">
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 text-center text-2xl">{item.emoji}</td>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                    <td className="p-4 text-center text-gray-500">{item.sort_order}</td>
                    <td className="p-4 flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}

            {!loading && mealTypes.length === 0 && !isAdding && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Belum ada data waktu makan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
