import { useState, useEffect } from "react";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { supabase } from "../../lib/supabase";

// MealTime type removed as we use dynamic string

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
  ingredientName: string;
  conversionId: number | null;
  conversionName: string;
  conversionFactor: number;
  weightCooked: number;
  weightRaw: number;
  bdd: number;
  weightNet: number;
}

interface Dish {
  id: string;
  name: string;
  items: DishItem[];
}

export default function MenuInputPage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  // Dynamic Meal Times
  const [mealTimeList, setMealTimeList] = useState<{ name: string; emoji: string }[]>([]);
  // Fallback if DB empty: use default
  const [activeMealTime, setActiveMealTime] = useState<string>("Pagi");
  const [activeCateringId, setActiveCateringId] = useState<number | null>(null);

  // Master Data & State
  const [caterings, setCaterings] = useState<{ id: number; name: string }[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [masterIngredients, setMasterIngredients] = useState<MasterIngredient[]>([]);
  const [masterConversions, setMasterConversions] = useState<MasterConversion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Initial Master Data
  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      try {
        // Meal Types
        const { data: mealData } = await supabase.from("meal_types").select("name, emoji").order("sort_order");
        if (mealData && mealData.length > 0) {
          setMealTimeList(mealData);
          // Set default if not set or invalid
          // If current activeMealTime is not in list, switch to first.
          // But we init with "Pagi", so let's just stick to "Pagi" unless it doesn't exist?
          // For safety, let's keep "Pagi" as initial state, but if list loads and "Pagi" not there, switch.
          const exists = mealData.find((m) => m.name === activeMealTime);
          if (!exists) setActiveMealTime(mealData[0].name);
        } else {
          // Fallback hardcoded if table empty
          setMealTimeList([
            { name: "Pagi", emoji: "🌅" },
            { name: "Siang", emoji: "☀️" },
            { name: "Malam", emoji: "🌙" },
            { name: "Snack Pagi", emoji: "☕" },
            { name: "Snack Sore", emoji: "☕" },
          ]);
        }

        // Caterings
        const { data: catData } = await supabase.from("caterings").select("id, name").order("name");
        if (catData && catData.length > 0) {
          setCaterings(catData);
          setActiveCateringId(catData[0].id); // Default first catering
        }

        // Master data (Limit for performance)
        const { data: convData } = await supabase.from("conversion_factors").select("id, food_name, conversion_factor, bdd_percent").order("food_name");
        if (convData) setMasterConversions(convData);

        const { data: ingData } = await supabase.from("ingredients_library").select("id, name, code, default_bdd_percent").limit(2000).order("name");
        if (ingData) setMasterIngredients(ingData);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, []);

  // Fetch Menu Data when Filters Change
  useEffect(() => {
    if (!activeCateringId) return;

    async function loadMenu() {
      // setIsLoading(true); // Optional: loading state per tab switch
      try {
        const { data: menuData } = await supabase.from("daily_menus").select("id").eq("date", selectedDate).eq("meal_time", activeMealTime).eq("catering_id", activeCateringId).maybeSingle();

        if (!menuData) {
          setDishes([]);
          return;
        }

        const { data: dbDishes } = await supabase
          .from("menu_dishes")
          .select(`id, name, dish_ingredients (id, ingredient_id, ingredient_name, conversion_id, conversion_factor, weight_cooked, weight_raw, weight_net, bdd_percent, conversion:conversion_factors(food_name))`)
          .eq("menu_id", menuData.id)
          .order("id", { ascending: true });

        if (dbDishes) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped: Dish[] = (dbDishes as any[]).map((d) => ({
            id: d.id,
            name: d.name,
            items:
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              d.dish_ingredients?.map((i: any) => ({
                id: i.id,
                ingredientId: i.ingredient_id,
                ingredientName: i.ingredient_name,
                conversionId: i.conversion_id,
                conversionName: i.conversion?.food_name ?? (i.conversion_id ? "Unknown" : ""),
                conversionFactor: i.conversion_factor || 1,
                weightCooked: i.weight_cooked || 0,
                weightRaw: i.weight_raw || 0,
                weightNet: i.weight_net || 0,
                bdd: i.bdd_percent || 100,
              })) || [],
          }));
          setDishes(mapped);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadMenu();
  }, [selectedDate, activeMealTime, activeCateringId]);

  // ---- Logic CRUD Menu ----
  const addDish = () => {
    setDishes([
      ...dishes,
      {
        id: crypto.randomUUID(),
        name: "",
        items: [
          {
            id: crypto.randomUUID(),
            ingredientId: null,
            ingredientName: "",
            conversionId: null,
            conversionName: "",
            conversionFactor: 1,
            weightCooked: 0,
            weightRaw: 0,
            weightNet: 0,
            bdd: 100,
          },
        ],
      },
    ]);
  };

  const addItemToDish = (dishId: string) => {
    setDishes(
      dishes.map((d) =>
        d.id === dishId
          ? {
              ...d,
              items: [
                ...d.items,
                {
                  id: crypto.randomUUID(),
                  ingredientId: null,
                  ingredientName: "",
                  conversionId: null,
                  conversionName: "",
                  conversionFactor: 1,
                  weightCooked: 0,
                  weightRaw: 0,
                  weightNet: 0,
                  bdd: 100,
                },
              ],
            }
          : d
      )
    );
  };

  const updateDishName = (id: string, val: string) => {
    setDishes(dishes.map((d) => (d.id === id ? { ...d, name: val } : d)));
  };

  const removeDish = (id: string) => {
    setDishes(dishes.filter((d) => d.id !== id));
  };

  const removeItem = (dishId: string, itemId: string) => {
    setDishes(
      dishes.map((d) => {
        if (d.id !== dishId) return d;
        const remainingItems = d.items.filter((i) => i.id !== itemId);
        if (remainingItems.length === 0) {
          // Keep at least one empty row? Or allows empty dish?
          // Better keeps empty row if it's the last one, logic here allows empty.
        }
        return { ...d, items: remainingItems };
      })
    );
  };

  const updateItem = (dishId: string, itemId: string, updates: Partial<DishItem>) => {
    setDishes(
      dishes.map((d) => {
        if (d.id !== dishId) return d;
        return {
          ...d,
          items: d.items.map((item) => {
            if (item.id !== itemId) return item;

            const newItem = { ...item, ...updates };
            // Calc logic
            const cooked = "weightCooked" in updates ? updates.weightCooked || 0 : newItem.weightCooked;
            const factor = "conversionFactor" in updates ? updates.conversionFactor || 1 : newItem.conversionFactor;
            const bdd = "bdd" in updates ? updates.bdd || 100 : newItem.bdd;

            // 1. Edible Mean Raw (Berat Mentah Bersih) = Berat Matang * Faktor
            const edibleRaw = cooked * factor;

            // 2. Gross Raw (Beli) = Edible / BDD
            let rawGross = 0;
            if (bdd > 0) rawGross = edibleRaw / (bdd / 100);
            else rawGross = edibleRaw;

            // Rice Logic
            const nameLower = newItem.ingredientName.toLowerCase();
            const isRiceDish = (nameLower.includes("nasi") || nameLower.includes("bubur") || nameLower.includes("lontong") || nameLower.includes("ketupat")) && !nameLower.includes("goreng");

            if (isRiceDish) {
              newItem.weightRaw = cooked;
              newItem.weightNet = cooked;
            } else {
              newItem.weightRaw = Number(rawGross.toFixed(1));
              newItem.weightNet = Number((newItem.weightRaw * (bdd / 100)).toFixed(1));
            }
            return newItem;
          }),
        };
      })
    );
  };

  const handleSave = async () => {
    if (!activeCateringId) return;
    setIsSaving(true);
    try {
      let menuId;
      const { data: exist } = await supabase.from("daily_menus").select("id").eq("date", selectedDate).eq("meal_time", activeMealTime).eq("catering_id", activeCateringId).maybeSingle();

      if (exist) {
        menuId = exist.id;
        await supabase.from("menu_dishes").delete().eq("menu_id", menuId);
      } else {
        const { data: newM } = await supabase.from("daily_menus").insert({ date: selectedDate, meal_time: activeMealTime, catering_id: activeCateringId }).select().single();
        if (newM) menuId = newM.id;
      }

      if (menuId) {
        for (const dish of dishes) {
          if (!dish.name && dish.items.length === 0) continue;
          // Allow dish name only? Or items only? Prefer Name.

          const { data: newDish } = await supabase
            .from("menu_dishes")
            .insert({ menu_id: menuId, name: dish.name || "Menu Tanpa Nama" })
            .select()
            .single();
          if (newDish && dish.items.length > 0) {
            const ings = dish.items.map((i) => ({
              dish_id: newDish.id,
              ingredient_id: i.ingredientId,
              ingredient_name: i.ingredientName,
              weight_cooked: i.weightCooked,
              weight_raw: i.weightRaw,
              weight_net: i.weightNet,
              conversion_factor: i.conversionFactor,
              conversion_id: i.conversionId,
              bdd_percent: i.bdd,
            }));
            await supabase.from("dish_ingredients").insert(ings);
          }
        }
      }
      // Feedback visual simple
      const btn = document.getElementById("save-btn");
      if (btn) {
        const originalText = btn.innerText;
        btn.innerText = "Tersimpan!";
        setTimeout(() => (btn.innerText = originalText), 2000);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">Input Gramasi Catering</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Tanggal Menu:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/20 rounded px-2 py-1 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-green-500 outline-none"
            />
          </div>
        </div>
        <div>
          <button id="save-btn" onClick={handleSave} disabled={isSaving || isLoading} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-500 disabled:opacity-50 transition-colors min-w-[120px]">
            {isSaving ? "Menyimpan..." : "Simpan Data"}
          </button>
        </div>
      </div>

      {/* Tabs Waktu Makan */}
      <div className="border-b border-gray-200 dark:border-white/10">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {mealTimeList.map((time) => (
            <button
              key={time.name}
              onClick={() => setActiveMealTime(time.name)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors outline-none
                ${activeMealTime === time.name ? "border-green-500 text-green-600 dark:text-green-400" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200"}
              `}
            >
              {time.emoji} {time.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tabs Catering */}
      <div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {caterings.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCateringId(cat.id)}
              className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                        ${activeCateringId === cat.id ? "bg-gray-900 text-white dark:bg-white dark:text-black shadow-md" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}
                    `}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Konten Tabel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden min-h-[400px]">
        {isLoading && <div className="p-4 text-center text-gray-500 animate-pulse">Memuat data...</div>}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 text-xs uppercase tracking-wider font-bold border-b border-blue-100 dark:border-blue-800/50">
                <th className="px-4 py-3 text-left w-64 border-r border-gray-200 dark:border-white/5">Menu Makanan</th>
                <th className="px-4 py-3 text-left w-56 border-r border-gray-200 dark:border-white/5">Cara Pengolahan (Faktor)</th>
                <th className="px-4 py-3 text-left w-64 border-r border-gray-200 dark:border-white/5">Bahan Makanan (TKPI)</th>
                <th className="px-2 py-3 text-center w-24 border-r border-gray-200 dark:border-white/5 bg-blue-100/50 dark:bg-blue-900/40">
                  Berat
                  <br />
                  Matang (gr)
                </th>
                <th className="px-2 py-3 text-center w-24 border-r border-gray-200 dark:border-white/5">
                  Berat
                  <br />
                  Mentah (gr)
                </th>
                <th className="px-2 py-3 text-center w-16 border-r border-gray-200 dark:border-white/5">
                  BDD
                  <br />
                  (%)
                </th>
                <th className="px-2 py-3 text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5 text-sm">
              {dishes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    Kosong.{" "}
                    <button onClick={addDish} className="text-green-600 hover:underline">
                      Tambah Menu Baru
                    </button>
                  </td>
                </tr>
              ) : (
                dishes.map((dish) => (
                  <>
                    {dish.items.map((item, itemIndex) => (
                      <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        {itemIndex === 0 && (
                          <td rowSpan={dish.items.length + 1} className="p-3 border-r border-gray-200 dark:border-white/5 align-top bg-gray-50/50 dark:bg-gray-900/30">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={dish.name}
                                onChange={(e) => updateDishName(dish.id, e.target.value)}
                                placeholder="Nama Menu..."
                                className="w-full bg-transparent font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-b focus:border-green-500 text-base"
                              />
                              <button onClick={() => removeDish(dish.id)} tabIndex={-1} className="text-gray-300 hover:text-red-500 transition-colors">
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}

                        <td className="p-0 border-r border-gray-200 dark:border-white/5">
                          <ConversionInput
                            value={item.conversionName}
                            onSelect={(id, name, factor) => updateItem(dish.id, item.id, { conversionId: id, conversionName: name, conversionFactor: factor })}
                            masterConversions={masterConversions}
                          />
                        </td>

                        <td className="p-0 border-r border-gray-200 dark:border-white/5">
                          <IngredientInput value={item.ingredientName} onSelect={(id, name, bdd) => updateItem(dish.id, item.id, { ingredientId: id, ingredientName: name, bdd })} masterIngredients={masterIngredients} />
                        </td>

                        <td className="p-0 border-r border-gray-200 dark:border-white/5 bg-blue-50/30 dark:bg-blue-900/10">
                          <input
                            type="number"
                            value={item.weightCooked || ""}
                            onChange={(e) => updateItem(dish.id, item.id, { weightCooked: parseFloat(e.target.value) || 0 })}
                            className="w-full h-full p-3 text-center bg-transparent focus:outline-none focus:bg-green-100 dark:focus:bg-green-900/30 font-bold text-gray-900 dark:text-white"
                            placeholder="0"
                          />
                        </td>

                        <td className="p-3 text-center font-mono border-r border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-300">{item.weightRaw}</td>

                        <td className="p-3 text-center border-r border-gray-200 dark:border-white/5 text-gray-500 text-xs">{item.bdd}</td>

                        <td className="p-2 text-center">
                          <button onClick={() => removeItem(dish.id, item.id)} tabIndex={-1} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* Add Item Row */}
                    <tr>
                      <td colSpan={6} className="p-2 bg-gray-50/30 dark:bg-white/5 border-t border-dashed border-gray-200 dark:border-white/10">
                        <button onClick={() => addItemToDish(dish.id)} className="text-xs font-semibold text-green-600 dark:text-green-400 hover:text-green-500 flex items-center gap-1 mx-auto uppercase tracking-wide">
                          <PlusIcon className="w-3 h-3" /> Tambah Bahan
                        </button>
                      </td>
                    </tr>
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 text-center">
          <button
            onClick={addDish}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/20 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm font-medium"
          >
            <PlusIcon className="w-5 h-5" /> Tambah Masakan Baru
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Subcomponents ----

function ConversionInput({ value, onSelect, masterConversions }: { value: string; onSelect: (id: number | null, name: string, factor: number) => void; masterConversions: MasterConversion[] }) {
  const [show, setShow] = useState(false);
  // Optimization: Filter only when show is true or typing?
  const suggestions = show ? masterConversions.filter((c) => c.food_name.toLowerCase().includes((value || "").toLowerCase())).slice(0, 10) : [];

  return (
    <div className="relative h-full">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onSelect(null, e.target.value, 1);
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder="Cara olah..."
        className="w-full h-full p-3 bg-transparent focus:outline-none focus:ring-inset focus:ring-2 focus:ring-green-500 text-sm border-none"
      />
      {show && suggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full min-w-[200px] z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 shadow-xl rounded-b-lg max-h-48 overflow-y-auto">
          {suggestions.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelect(s.id, s.food_name, s.conversion_factor)}
              className="p-2 hover:bg-green-50 dark:hover:bg-white/10 cursor-pointer flex justify-between text-xs text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-white/5 last:border-0"
            >
              <span>{s.food_name}</span>
              <span className="font-bold text-green-600">x{s.conversion_factor}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IngredientInput({ value, onSelect, masterIngredients }: { value: string; onSelect: (id: number | null, name: string, bdd: number) => void; masterIngredients: MasterIngredient[] }) {
  const [show, setShow] = useState(false);
  const suggestions = show ? masterIngredients.filter((i) => i.name.toLowerCase().includes((value || "").toLowerCase())).slice(0, 20) : [];

  return (
    <div className="relative h-full">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onSelect(null, e.target.value, 100);
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder="Cari bahan..."
        className="w-full h-full p-3 bg-transparent focus:outline-none focus:ring-inset focus:ring-2 focus:ring-green-500 text-sm border-none"
      />
      {show && suggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full min-w-[300px] z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 shadow-xl rounded-b-lg max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelect(s.id, s.name, s.default_bdd_percent || 100)}
              className="px-3 py-2 hover:bg-green-50 dark:hover:bg-white/10 cursor-pointer text-xs text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-white/5 last:border-0"
            >
              <span className="text-green-600 font-mono mr-2 font-bold">{s.code}</span> {s.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
