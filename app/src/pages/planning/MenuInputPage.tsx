import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { TrashIcon, PlusIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
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
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locationState = location.state as any;

  const [selectedDate, setSelectedDate] = useState<string>(locationState?.date || new Date().toISOString().split("T")[0]);
  const [activeMealTime, setActiveMealTime] = useState<MealTime | null>(locationState?.mealTime || null);

  if (activeMealTime) {
    return <MenuDetailTable mealTime={activeMealTime} date={selectedDate} onBack={() => setActiveMealTime(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Input Menu Harian</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Perencanaan gramasi harian catering</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(["Pagi", "Siang", "Malam", "Snack Pagi", "Snack Sore"] as MealTime[]).map((waktu) => (
          <div
            key={waktu}
            onClick={() => setActiveMealTime(waktu)}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 hover:shadow-lg hover:border-green-500/50 transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[200px] text-center"
          >
            <div className="mb-4 p-4 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
              <span className="text-3xl">{waktu === "Pagi" ? "🌅" : waktu === "Siang" ? "☀️" : waktu === "Malam" ? "🌙" : "🍪"}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{waktu}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola gramasi menu</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuDetailTable({ mealTime, date, onBack }: { mealTime: MealTime; date: string; onBack: () => void }) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [caterings, setCaterings] = useState<{ id: number; name: string }[]>([]);
  const [selectedCateringId, setSelectedCateringId] = useState<number | null>(null);
  const [masterIngredients, setMasterIngredients] = useState<MasterIngredient[]>([]);
  const [masterConversions, setMasterConversions] = useState<MasterConversion[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function initData() {
      try {
        const { data: catData } = await supabase.from("caterings").select("id, name").order("name");
        if (catData) {
          setCaterings(catData);
          if (catData.length > 0) setSelectedCateringId(catData[0].id);
        }

        const { data: convData } = await supabase.from("conversion_factors").select("id, food_name, conversion_factor, bdd_percent").order("food_name");
        if (convData) setMasterConversions(convData);

        const { data: ingData } = await supabase.from("ingredients_library").select("id, name, code, default_bdd_percent").limit(2000).order("name");
        if (ingData) setMasterIngredients(ingData);
      } catch (e) {
        console.error(e);
      }
    }
    initData();
  }, []);

  useEffect(() => {
    if (!selectedCateringId) return;
    async function loadMenu() {
      try {
        const { data: menuData } = await supabase.from("daily_menus").select("id").eq("date", date).eq("meal_time", mealTime).eq("catering_id", selectedCateringId).maybeSingle();

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
  }, [selectedCateringId, date, mealTime]);

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
        return { ...d, items: d.items.filter((i) => i.id !== itemId) };
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

            const cooked = "weightCooked" in updates ? updates.weightCooked || 0 : newItem.weightCooked;
            const factor = "conversionFactor" in updates ? updates.conversionFactor || 1 : newItem.conversionFactor;
            const bdd = "bdd" in updates ? updates.bdd || 100 : newItem.bdd;

            // Enhanced Weight Logic
            // 1. Edible Mean Raw (Berat Mentah Bersih) = Berat Matang * Faktor
            const edibleRaw = cooked * factor;

            // 2. Raw Weight (Berat Mentah Kotor/Beli) = Edible Raw / (BDD/100)
            // Rumus: Gross = Net / Percentage
            let rawGross = 0;
            if (bdd > 0) {
              rawGross = edibleRaw / (bdd / 100);
            } else {
              rawGross = edibleRaw;
            }

            // Enhanced Rice Detection logic
            const nameLower = newItem.ingredientName.toLowerCase();
            const isRiceDish = (nameLower.includes("nasi") || nameLower.includes("bubur") || nameLower.includes("lontong") || nameLower.includes("ketupat")) && !nameLower.includes("goreng");

            if (isRiceDish) {
              // Khusus Nasi: Berat Mentah yg ditampilkan = Berat Matang (Agar user tidak bingung belanja nasi? Atau belanja beras?)
              // Biasanya user input Nasi Matang, tapi kalau mau hitung beras harusnya pakai faktor 0.4
              // TAPI User request "Berat Bersih = Berat Matang" kemarin.
              // Mari kita set Raw = Cooked saja untuk aman agar tidak meledak angkanya.
              newItem.weightRaw = cooked;
              newItem.weightNet = cooked;
            } else {
              newItem.weightRaw = Number(rawGross.toFixed(1));
              // Net Weight (Gizi) = Raw Gross * BDD (Kembali ke Edible Raw)
              newItem.weightNet = Number((newItem.weightRaw * (bdd / 100)).toFixed(1));
            }
            return newItem;
          }),
        };
      })
    );
  };

  const handleSave = async () => {
    if (!selectedCateringId) return;
    setIsSaving(true);
    try {
      let menuId;
      const { data: exist } = await supabase.from("daily_menus").select("id").eq("date", date).eq("meal_time", mealTime).eq("catering_id", selectedCateringId).maybeSingle();

      if (exist) {
        menuId = exist.id;
        await supabase.from("menu_dishes").delete().eq("menu_id", menuId);
      } else {
        const { data: newM } = await supabase.from("daily_menus").insert({ date, meal_time: mealTime, catering_id: selectedCateringId }).select().single();
        if (newM) menuId = newM.id;
      }

      if (menuId) {
        for (const dish of dishes) {
          if (!dish.name) continue;
          const { data: newDish } = await supabase.from("menu_dishes").insert({ menu_id: menuId, name: dish.name }).select().single();
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
      alert("Data tersimpan!");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="sticky top-0 z-30 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-white/10 pb-4 pt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">GRAMASI HARIAN CATERING</h1>
              <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  Tanggal: <span className="text-gray-900 dark:text-white font-medium">{date}</span>
                </span>
                <span>
                  Jam: <span className="text-gray-900 dark:text-white font-medium">{mealTime}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedCateringId || ""}
              onChange={(e) => setSelectedCateringId(Number(e.target.value))}
              className="flex-1 md:w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            >
              {caterings.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-500 disabled:opacity-50 transition-colors">
              {isSaving ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 text-xs uppercase tracking-wider font-bold border-b border-blue-200 dark:border-blue-800">
                <th className="px-4 py-3 text-left w-64 border-r border-blue-200 dark:border-blue-800">Menu Makanan</th>
                <th className="px-4 py-3 text-left w-64 border-r border-blue-200 dark:border-blue-800">Cara Pengolahan (Faktor)</th>
                <th className="px-4 py-3 text-left w-64 border-r border-blue-200 dark:border-blue-800">Bahan Makanan (TKPI)</th>
                <th className="px-2 py-3 text-center w-24 border-r border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                  Berat
                  <br />
                  Matang (gr)
                </th>
                <th className="px-2 py-3 text-center w-24 border-r border-blue-200 dark:border-blue-800">
                  Berat
                  <br />
                  Mentah (gr)
                </th>
                <th className="px-2 py-3 text-center w-20 border-r border-blue-200 dark:border-blue-800">
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
                    Belum ada menu. Klik Tambah Menu di bawah.
                  </td>
                </tr>
              ) : (
                dishes.map((dish) => (
                  <>
                    {dish.items.map((item, itemIndex) => (
                      <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        {itemIndex === 0 && (
                          <td rowSpan={dish.items.length + 1} className="p-3 border-r border-gray-200 dark:border-white/10 align-top bg-gray-50/50 dark:bg-black/20">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={dish.name}
                                onChange={(e) => updateDishName(dish.id, e.target.value)}
                                placeholder="Nama Menu..."
                                className="w-full bg-transparent font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-b focus:border-green-500"
                              />
                              <button onClick={() => removeDish(dish.id)} tabIndex={-1} className="text-gray-400 hover:text-red-500">
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}

                        <td className="p-0 border-r border-gray-200 dark:border-white/10">
                          <ConversionInput
                            value={item.conversionName}
                            onSelect={(id, name, factor) => updateItem(dish.id, item.id, { conversionId: id, conversionName: name, conversionFactor: factor })}
                            masterConversions={masterConversions}
                          />
                        </td>

                        <td className="p-0 border-r border-gray-200 dark:border-white/10">
                          <IngredientInput value={item.ingredientName} onSelect={(id, name, bdd) => updateItem(dish.id, item.id, { ingredientId: id, ingredientName: name, bdd })} masterIngredients={masterIngredients} />
                        </td>

                        <td className="p-0 border-r border-gray-200 dark:border-white/10 bg-blue-50/30 dark:bg-blue-900/10">
                          <input
                            type="number"
                            value={item.weightCooked || ""}
                            onChange={(e) => updateItem(dish.id, item.id, { weightCooked: parseFloat(e.target.value) || 0 })}
                            className="w-full h-full p-3 text-center bg-transparent focus:outline-none focus:bg-green-50 dark:focus:bg-green-900/20 font-medium"
                            placeholder="0"
                          />
                        </td>

                        <td className="p-3 text-center font-mono border-r border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400">{item.weightRaw}</td>

                        <td className="p-3 text-center border-r border-gray-200 dark:border-white/10 text-gray-500">{item.bdd}</td>

                        <td className="p-2 text-center">
                          <button onClick={() => removeItem(dish.id, item.id)} tabIndex={-1} className="text-gray-300 hover:text-red-500">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* Add Item Row Inside Dish */}
                    <tr>
                      <td colSpan={6} className="p-2 bg-gray-50/50 dark:bg-white/5 border-t border-dashed border-gray-200 dark:border-white/10">
                        <button onClick={() => addItemToDish(dish.id)} className="text-xs font-medium text-green-600 dark:text-green-400 hover:underline flex items-center gap-1 mx-auto">
                          <PlusIcon className="w-3 h-3" /> Tambah Bahan untuk {dish.name || "Menu Ini"}
                        </button>
                      </td>
                    </tr>
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={addDish}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-lg text-gray-500 dark:text-gray-400 hover:border-green-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all font-medium flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-5 h-5" /> Tambah Menu Baru
          </button>
        </div>
      </div>
    </div>
  );
}

function ConversionInput({ value, onSelect, masterConversions }: { value: string; onSelect: (id: number | null, name: string, factor: number) => void; masterConversions: MasterConversion[] }) {
  const [show, setShow] = useState(false);
  const suggestions = masterConversions.filter((c) => c.food_name.toLowerCase().includes((value || "").toLowerCase())).slice(0, 10);

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
        className="w-full h-full p-3 bg-transparent focus:outline-none focus:ring-inset focus:ring-2 focus:ring-green-500"
      />
      {show && suggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full min-w-[200px] z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 shadow-xl rounded-b-lg max-h-48 overflow-y-auto">
          {suggestions.map((s) => (
            <div key={s.id} onClick={() => onSelect(s.id, s.food_name, s.conversion_factor)} className="p-2 hover:bg-green-50 dark:hover:bg-white/10 cursor-pointer flex justify-between text-xs text-gray-700 dark:text-gray-200">
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
  const suggestions = masterIngredients.filter((i) => i.name.toLowerCase().includes((value || "").toLowerCase())).slice(0, 10);

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
        className="w-full h-full p-3 bg-transparent focus:outline-none focus:ring-inset focus:ring-2 focus:ring-green-500"
      />
      {show && suggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full min-w-[250px] z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 shadow-xl rounded-b-lg max-h-48 overflow-y-auto">
          {suggestions.map((s) => (
            <div key={s.id} onClick={() => onSelect(s.id, s.name, s.default_bdd_percent || 100)} className="p-2 hover:bg-green-50 dark:hover:bg-white/10 cursor-pointer text-xs text-gray-700 dark:text-gray-200">
              <span className="text-green-500 font-mono mr-2">{s.code}</span> {s.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
