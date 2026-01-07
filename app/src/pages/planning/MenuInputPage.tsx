import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { supabase } from "../../lib/supabase";

type MealTime = "Pagi" | "Siang" | "Malam" | "Snack Pagi" | "Snack Sore";

interface MasterIngredient {
  id: number;
  name: string;
  code: string;
  default_bdd_percent: number | null;
}

interface MasterConversion {
  id: number;
  food_name: string;
  conversion_factor: number;
  bdd_percent: number | null;
}

interface DishItem {
  id: string;
  ingredientId: number | null;
  ingredientName: string; // Display name for input
  conversionId: number | null;
  conversionName: string; // Display name for input
  conversionFactor: number;
  weightCooked: number; // Berat Matang (Input)
  weightRaw: number; // Berat Mentah (Calculated)
  bdd: number; // BDD (%) dari TKPI
  weightNet: number; // Berat Bersih (Calculated)
}

interface Dish {
  id: string;
  name: string;
  items: DishItem[];
}

export default function MenuInputPage() {
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locationState = location.state as any;

  const [selectedDate, setSelectedDate] = useState<string>(locationState?.date || new Date().toISOString().split("T")[0]);
  const [activeMealTime, setActiveMealTime] = useState<MealTime | null>(locationState?.mealTime || null);

  if (activeMealTime) {
    return <MenuDetailForm mealTime={activeMealTime} date={selectedDate} onBack={() => setActiveMealTime(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Input Menu Harian</h2>
          <p className="text-gray-400 mt-1">Perencanaan menu catering dan perhitungan gizi</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-gray-900 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-green-500 outline-none" />
        </div>
      </div>

      {/* Waktu Makan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(["Pagi", "Siang", "Malam", "Snack Pagi", "Snack Sore"] as MealTime[]).map((waktu) => (
          <div
            key={waktu}
            onClick={() => setActiveMealTime(waktu)}
            className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-[200px] text-center border-dashed"
          >
            <div className="mb-4 p-4 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
              <span className="text-2xl">🍽️</span>
            </div>
            <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">{waktu}</h3>
            <p className="text-sm text-gray-500 mt-1">Belum ada menu</p>
            <button className="mt-4 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-200">
              + Kelola Menu
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuDetailForm({ mealTime, date, onBack }: { mealTime: MealTime; date: string; onBack: () => void }) {
  const [dishes, setDishes] = useState<Dish[]>([]);

  // State for Catering
  type Catering = { id: number; name: string };
  const [caterings, setCaterings] = useState<Catering[]>([]);
  const [selectedCateringId, setSelectedCateringId] = useState<number | null>(null);

  // Fetch Caterings on Mount
  useEffect(() => {
    async function fetchCaterings() {
      const { data, error } = await supabase.from("caterings").select("id, name").order("name");
      if (error) console.error("Error fetching caterings:", error);
      if (data && data.length > 0) {
        setCaterings(data);
        // Auto select first catering if none selected, using functional update to avoid dependency cycle
        setSelectedCateringId((prev) => prev ?? data[0].id);
      }
    }
    fetchCaterings();
  }, []);

  // Master Data States
  const [masterIngredients, setMasterIngredients] = useState<MasterIngredient[]>([]);
  const [masterConversions, setMasterConversions] = useState<MasterConversion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Master Data
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Ingredients (Fetch all with loop)
        let allIngredients: MasterIngredient[] = [];
        let page = 0;
        const pageSize = 1000;
        while (true) {
          const { data, error } = await supabase
            .from("ingredients_library")
            .select("id, name, code, default_bdd_percent")
            .range(page * pageSize, (page + 1) * pageSize - 1)
            .order("name");
          if (error) throw error;
          if (!data || data.length === 0) break;
          allIngredients = [...allIngredients, ...data];
          if (data.length < pageSize) break;
          page++;
        }
        setMasterIngredients(allIngredients);

        // Fetch Conversions
        const { data: convData } = await supabase.from("conversion_factors").select("id, food_name, conversion_factor, bdd_percent").order("food_name");
        if (convData) setMasterConversions(convData);
      } catch (error) {
        console.error("Error fetching master data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Load Existing Menu
  useEffect(() => {
    async function loadMenu() {
      if (!selectedCateringId) {
        setDishes([]);
        return;
      }

      // Master data isLoading controls the UI blocker, we can piggyback or just let it flow
      try {
        // Find menu header
        const { data: menuData } = await supabase.from("daily_menus").select("id").eq("date", date).eq("meal_time", mealTime).eq("catering_id", selectedCateringId).maybeSingle();

        if (!menuData) {
          setDishes([]); // No saved menu, new
          return;
        }

        // Fetch detail dishes
        const { data: dbDishes, error } = await supabase
          .from("menu_dishes")
          .select(
            `
                    id, 
                    name, 
                    dish_ingredients (
                        id,
                        ingredient_id,
                        ingredient_name,
                        weight_cooked,
                        weight_raw,
                        weight_net,
                        conversion_factor,
                        conversion_id,
                        conversion:conversion_factors(food_name),
                        bdd_percent
                    )
                `
          )
          .eq("menu_id", menuData.id)
          .order("id", { ascending: true });

        if (error) throw error;

        if (dbDishes) {
          const mappedDishes: Dish[] = dbDishes.map((d) => ({
            id: String(d.id),
            name: d.name,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            items: d.dish_ingredients.map((i: any) => ({
              id: String(i.id),
              ingredientId: i.ingredient_id,
              ingredientName: i.ingredient_name,
              conversionId: i.conversion_id,
              conversionName: i.conversion?.food_name ?? (i.conversion_id ? "Unknown" : `Faktor: ${i.conversion_factor}`),
              conversionFactor: i.conversion_factor,
              weightCooked: i.weight_cooked || 0,
              weightRaw: i.weight_raw,
              bdd: i.bdd_percent,
              weightNet: i.weight_net,
            })),
          }));
          setDishes(mappedDishes);
        }
      } catch (err) {
        console.error("Error loading menu:", err);
      }
    }

    loadMenu();
  }, [date, mealTime, selectedCateringId]);

  // Master Data States

  const addDish = () => {
    const newDish: Dish = { id: crypto.randomUUID(), name: "", items: [] };
    setDishes([...dishes, newDish]);
  };

  const updateDishName = (id: string, name: string) => {
    setDishes(dishes.map((d) => (d.id === id ? { ...d, name } : d)));
  };

  const deleteDish = (id: string) => {
    setDishes(dishes.filter((d) => d.id !== id));
  };

  const addItem = (dishId: string) => {
    const newItem: DishItem = {
      id: crypto.randomUUID(),
      ingredientId: null,
      ingredientName: "",
      conversionId: null,
      conversionName: "",
      conversionFactor: 1,
      weightCooked: 0,
      weightRaw: 0,
      bdd: 100,
      weightNet: 0,
    };
    setDishes(dishes.map((d) => (d.id === dishId ? { ...d, items: [...d.items, newItem] } : d)));
  };

  const updateItem = (dishId: string, itemId: string, updates: Partial<DishItem>) => {
    setDishes(
      dishes.map((d) => {
        if (d.id !== dishId) return d;
        return {
          ...d,
          items: d.items.map((item) => {
            if (item.id !== itemId) return item;

            const updatedItem = { ...item, ...updates };

            // Logic Kalkulasi
            const cooked = "weightCooked" in updates ? updates.weightCooked || 0 : item.weightCooked;
            const factor = "conversionFactor" in updates ? updates.conversionFactor || 1 : item.conversionFactor;
            const bdd = "bdd" in updates ? updates.bdd || 100 : item.bdd;

            // 1. Hitung Berat Mentah (Matang * Faktor)
            const weightRaw = cooked * factor;
            updatedItem.weightRaw = Number(weightRaw.toFixed(1));

            // 2. Hitung Berat Bersih (Mentah * BDD/100), Kecuali Nasi
            const isNasi = updatedItem.ingredientName.trim().toLowerCase() === "nasi" || updatedItem.ingredientName.trim().toLowerCase() === "nasi putih";

            if (isNasi) {
              updatedItem.weightNet = cooked; // Khusus Nasi, Berat Bersih = Berat Matang
            } else {
              const weightNet = weightRaw * (bdd / 100);
              updatedItem.weightNet = Number(weightNet.toFixed(1));
            }

            return updatedItem;
          }),
        };
      })
    );
  };

  const deleteItem = (dishId: string, itemId: string) => {
    setDishes(dishes.map((d) => (d.id === dishId ? { ...d, items: d.items.filter((i) => i.id !== itemId) } : d)));
  };

  // Save Menu Logic
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMenu = async () => {
    if (!selectedCateringId) {
      alert("Mohon pilih catering terlebih dahulu.");
      return;
    }

    if (dishes.length === 0) {
      alert("Menu masih kosong.");
      return;
    }

    const cateringName = caterings.find((c) => c.id === selectedCateringId)?.name;
    // Perbaikan: Konfirmasi hanya jika menimpa data (opsional), tapi standardnya konfirmasi simpan.
    if (!window.confirm(`Simpan menu ${mealTime} (${cateringName}) untuk tanggal ${date}?`)) return;

    setIsSaving(true);
    try {
      // 1. Check/Create Daily Menu Header
      let menuId;

      // Cek apakah sudah ada menu untuk tanggal & waktu ini
      const { data: existingMenu } = await supabase.from("daily_menus").select("id").eq("date", date).eq("meal_time", mealTime).eq("catering_id", selectedCateringId).maybeSingle(); // Safe check

      if (existingMenu) {
        menuId = existingMenu.id;
        // Hapus masakan lama (cascade delete ingredients) untuk replace dengan yang baru
        const { error: deleteError } = await supabase.from("menu_dishes").delete().eq("menu_id", menuId);
        if (deleteError) throw deleteError;
      } else {
        // Buat header baru
        const { data: newMenu, error: createError } = await supabase
          .from("daily_menus")
          .insert({
            date,
            meal_time: mealTime,
            catering_id: selectedCateringId,
          })
          .select()
          .single();
        if (createError) throw createError;
        menuId = newMenu.id;
      }

      // 2. Insert Dishes & Ingredients Batch
      // Kita loop per dish karena butuh dishes.id untuk ingredients
      for (const dish of dishes) {
        const { data: dishData, error: dishError } = await supabase.from("menu_dishes").insert({ menu_id: menuId, name: dish.name }).select().single();

        if (dishError) throw dishError;

        if (dish.items.length > 0) {
          const ingredientsPayload = dish.items.map((item) => ({
            dish_id: dishData.id,
            ingredient_id: item.ingredientId, // Bisa null jika manual text
            ingredient_name: item.ingredientName,
            weight_cooked: item.weightCooked,
            weight_raw: item.weightRaw,
            weight_net: item.weightNet, // Hasil kalkulasi
            conversion_factor: item.conversionFactor,
            conversion_id: item.conversionId || null,
            bdd_percent: item.bdd,
          }));

          const { error: ingError } = await supabase.from("dish_ingredients").insert(ingredientsPayload);
          if (ingError) throw ingError;
        }
      }

      alert("Berhasil! Menu telah disimpan.");
      onBack(); // Kembali ke overview
    } catch (err) {
      console.error("Save Error:", err);
      alert("Gagal menyimpan menu. Cek console untuk detail.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            ← Kembali
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">{mealTime === "Pagi" ? "🌅" : mealTime === "Siang" ? "☀️" : mealTime === "Malam" ? "🌙" : "🍪"}</span>
              Menu {mealTime}
            </h2>
            <p className="text-gray-400 text-sm mt-1">{date}</p>
          </div>
        </div>

        <button
          onClick={handleSaveMenu}
          disabled={isSaving || !selectedCateringId}
          className="px-6 py-2 rounded-lg bg-green-600 font-semibold text-white shadow-lg hover:bg-green-500 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>💾 Simpan Menu</>
          )}
        </button>
      </div>

      {/* Catering Tabs */}
      <div className="border-b border-white/10">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {caterings.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCateringId(cat.id)}
              className={`
                whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors outline-none
                ${selectedCateringId === cat.id ? "border-green-500 text-green-400" : "border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300"}
              `}
            >
              {cat.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Loading */}
      {isLoading && <p className="text-gray-400 animate-pulse">Memuat data master...</p>}

      {/* Container Masakan */}
      <div className="space-y-8">
        {!selectedCateringId ? (
          <div className="text-center py-12 rounded-xl border border-dashed border-yellow-500/20 bg-yellow-500/5 animate-pulse">
            <p className="text-yellow-400 mb-2 font-semibold text-lg">⚠️ Catering Belum Dipilih</p>
            <p className="text-gray-400">Silakan pilih catering di pojok kanan atas untuk melihat atau menginput menu.</p>
          </div>
        ) : dishes.length === 0 && !isLoading ? (
          <div className="text-center py-12 rounded-xl border border-dashed border-white/10 bg-white/5">
            <p className="text-gray-400 mb-4">Belum ada masakan untuk menu {mealTime}</p>
            <button onClick={addDish} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-500 transition-colors">
              <PlusIcon className="h-5 w-5" />
              Tambah Masakan
            </button>
          </div>
        ) : (
          dishes.map((dish, index) => (
            <div key={dish.id} className="rounded-xl border border-white/10 bg-white/5 p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1 mr-4">
                  <input
                    type="text"
                    value={dish.name}
                    onChange={(e) => updateDishName(dish.id, e.target.value)}
                    placeholder={`Nama Masakan ${index + 1}`}
                    className="w-full bg-transparent border-b border-white/10 px-0 py-2 text-xl font-bold text-white placeholder-gray-600 focus:ring-0 focus:border-green-500 outline-none transition-colors"
                  />
                </div>
                <button onClick={() => deleteDish(dish.id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-white/5">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Section Bahan Makanan */}
              <div className="bg-gray-900/50 rounded-lg border border-white/5">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 bg-white/5">
                      <th className="px-4 py-3 font-medium w-1/4">Bahan Makanan (TKPI)</th>
                      <th className="px-4 py-3 font-medium w-1/5">Pengolahan (Faktor)</th>
                      <th className="px-4 py-3 font-medium text-right w-20">Matang(g)</th>
                      <th className="px-4 py-3 font-medium text-right w-20 text-green-400">Mentah(g)</th>
                      <th className="px-4 py-3 font-medium text-center w-24 text-purple-400">BDD (g)</th>
                      <th className="px-4 py-3 font-medium w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {dish.items.map((item) => (
                      <IngredientRow
                        key={item.id}
                        item={item}
                        masterIngredients={masterIngredients}
                        masterConversions={masterConversions}
                        onUpdate={(updates) => updateItem(dish.id, item.id, updates)}
                        onDelete={() => deleteItem(dish.id, item.id)}
                      />
                    ))}
                    {dish.items.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500 italic">
                          Belum ada bahan. Klik "Tambah Bahan" di bawah.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <button onClick={() => addItem(dish.id)} className="w-full py-3 text-xs font-medium text-green-400 hover:text-green-300 hover:bg-green-500/10 transition-colors border-t border-white/5 flex items-center justify-center gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Tambah Bahan Makanan
                </button>
              </div>
            </div>
          ))
        )}

        {/* Tombol Tambah Masakan */}
        {dishes.length > 0 && (
          <button onClick={addDish} className="w-full py-4 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Tambah Masakan Lain
          </button>
        )}
      </div>
    </div>
  );
}

// Subcomponent for Row Item to handle internal dropdown state
function IngredientRow({
  item,
  masterIngredients,
  masterConversions,
  onUpdate,
  onDelete,
}: {
  item: DishItem;
  masterIngredients: MasterIngredient[];
  masterConversions: MasterConversion[];
  onUpdate: (updates: Partial<DishItem>) => void;
  onDelete: () => void;
}) {
  const [showIngSuggestions, setShowIngSuggestions] = useState(false);
  const [showConvSuggestions, setShowConvSuggestions] = useState(false);
  const ingInputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions
  const ingSuggestions = masterIngredients.filter((m) => m.name.toLowerCase().includes(item.ingredientName.toLowerCase())).slice(0, 50);

  const convSuggestions = masterConversions.filter((m) => m.food_name.toLowerCase().includes(item.conversionName.toLowerCase())).slice(0, 50);

  return (
    <tr className="hover:bg-white/5 transition-colors group">
      {/* Bahan TKPI Input */}
      <td className="px-4 py-2 relative">
        <div className="relative">
          <input
            ref={ingInputRef}
            type="text"
            value={item.ingredientName}
            onChange={(e) => {
              onUpdate({ ingredientName: e.target.value, ingredientId: null });
              setShowIngSuggestions(true);
            }}
            onFocus={() => setShowIngSuggestions(true)}
            onBlur={() => setTimeout(() => setShowIngSuggestions(false), 200)}
            placeholder="Cari bahan..."
            className={`w-full bg-transparent border-b ${
              !item.ingredientId && item.ingredientName ? "border-red-500/50 text-red-100" : "border-white/10 text-white"
            } px-2 py-1 focus:border-green-500 focus:outline-none placeholder-gray-600 transition-colors`}
          />
          {showIngSuggestions && ingSuggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full md:w-[300px] max-h-48 overflow-y-auto bg-gray-800 border border-white/10 rounded-lg shadow-xl z-50 mt-1">
              {ingSuggestions.map((ing) => (
                <div
                  key={ing.id}
                  onClick={() =>
                    onUpdate({
                      ingredientId: ing.id,
                      ingredientName: ing.name,
                      bdd: ing.default_bdd_percent ?? 100,
                    })
                  }
                  className="px-3 py-2 hover:bg-white/10 cursor-pointer text-gray-300 text-xs border-b border-white/5 last:border-0"
                >
                  <span className="text-green-500 font-mono mr-2">{ing.code}</span>
                  {ing.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </td>

      {/* Konversi Input */}
      <td className="px-4 py-2 relative">
        <div className="relative">
          <input
            type="text"
            value={item.conversionName}
            onChange={(e) => {
              onUpdate({ conversionName: e.target.value, conversionId: null, conversionFactor: 1 });
              setShowConvSuggestions(true);
            }}
            onFocus={() => setShowConvSuggestions(true)}
            onBlur={() => setTimeout(() => setShowConvSuggestions(false), 200)}
            placeholder="Bentuk..."
            className={`w-full bg-transparent border-b ${
              !item.conversionId && item.conversionName ? "border-red-500/50 text-red-100" : "border-white/10 text-white"
            } px-2 py-1 focus:border-green-500 focus:outline-none placeholder-gray-600 transition-colors`}
          />
          {showConvSuggestions && convSuggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full md:w-[200px] max-h-48 overflow-y-auto bg-gray-800 border border-white/10 rounded-lg shadow-xl z-50 mt-1">
              {convSuggestions.map((conv) => {
                const updates: Partial<DishItem> = {
                  conversionId: conv.id,
                  conversionName: conv.food_name,
                  conversionFactor: conv.conversion_factor,
                };
                return (
                  <div key={conv.id} onClick={() => onUpdate(updates)} className="px-3 py-2 hover:bg-white/10 cursor-pointer text-gray-300 text-xs border-b border-white/5 last:border-0 flex justify-between">
                    <span>{conv.food_name}</span>
                    <div className="flex gap-2 text-xs">
                      <span className="text-yellow-500 font-bold">x{conv.conversion_factor}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </td>

      {/* Berat Matang */}
      <td className="px-4 py-2">
        <input
          type="number"
          value={item.weightCooked || ""}
          onChange={(e) => onUpdate({ weightCooked: parseFloat(e.target.value) || 0 })}
          placeholder="0"
          className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-right text-white focus:border-green-500 focus:outline-none placeholder-gray-600 transition-colors"
        />
      </td>

      {/* Berat Mentah (Calc) */}
      <td className="px-4 py-2">
        <div className="text-right text-green-400 font-bold px-2 py-1 bg-white/5 rounded">{item.weightRaw}</div>
      </td>

      {/* BDD (g) */}
      <td className="px-4 py-2">
        <div className="text-center text-purple-400 font-bold px-2 py-1 bg-white/5 rounded">{item.weightNet}</div>
      </td>

      {/* Delete */}
      <td className="px-4 py-2 text-center">
        <button onClick={onDelete} className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <TrashIcon className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
