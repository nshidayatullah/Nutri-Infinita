import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { PrinterIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Switch } from "@headlessui/react"; // Assuming headlessui is available, or simplistic manual toggle

// Types
type Ingredient = {
  ingredient_name: string;
  weight_cooked: number;
  weight_raw: number;
  bdd_percent: number;
  conversion_factor: number;
  conversion: { food_name: string } | null;
  ingredients_library: { energy_kcal: number } | null;
};

type FlatRow = {
  cateringName: string;
  dishName: string;
  ingredient: Ingredient;
  cateringRowSpan: number;
  dishRowSpan: number;
  calories: number;
};

// Metadata for menu compliance
type MenuMeta = {
  id: number;
  isCompliant: boolean;
};

// Helper: Calculate Calories
function calculateCalories(weightRaw: number, bdd: number, energyPer100g: number): number {
  const edibleWeight = weightRaw * (bdd / 100);
  return (edibleWeight / 100) * energyPer100g;
}

// Reusable Table Component with Compliance Toggle
function ReportTable({ title, rows, loading, menuMeta, onToggleCompliance }: { title: string; rows: FlatRow[]; loading: boolean; menuMeta: MenuMeta | null; onToggleCompliance: (id: number, currentStatus: boolean) => void }) {
  // Calculate Total Calories
  const totalCalories = rows.reduce((sum, row) => sum + row.calories, 0);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black mb-8 break-inside-avoid shadow-lg transition-all duration-300 hover:border-white/20">
      <div className="bg-white/10 px-4 py-3 border-b border-white/10 print:bg-gray-200 print:border-black print:text-black flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-white print:text-black uppercase tracking-wider mobile:text-base">{title}</h3>

          {/* Compliance Toggle (Hidden on Print) */}
          {menuMeta && (
            <div className="flex items-center gap-2 print:hidden bg-gray-900/50 px-3 py-1 rounded-full border border-white/10">
              <span className={`text-xs font-semibold ${menuMeta.isCompliant ? "text-green-400" : "text-red-400"}`}>{menuMeta.isCompliant ? "Sesuai Standar" : "Tidak Sesuai"}</span>
              <button
                onClick={() => onToggleCompliance(menuMeta.id, menuMeta.isCompliant)}
                className={`
                                    relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900
                                    ${menuMeta.isCompliant ? "bg-green-600" : "bg-gray-600"}
                                `}
              >
                <span className="sr-only">Toggle Compliance</span>
                <span
                  className={`
                                        inline-block h-3 w-3 transform rounded-full bg-white transition-transform
                                        ${menuMeta.isCompliant ? "translate-x-5" : "translate-x-1"}
                                    `}
                />
              </button>
            </div>
          )}

          {/* Print Only Compliance Badge */}
          {menuMeta && (
            <div className="hidden print:flex items-center gap-1 border border-black px-2 py-0.5 rounded text-xs uppercase font-bold">
              {menuMeta.isCompliant ? (
                <>
                  <span>[ OK ] Sesuai</span>
                </>
              ) : (
                <>
                  <span>[ ! ] Tidak Sesuai</span>
                </>
              )}
            </div>
          )}
        </div>

        <span className="text-sm font-mono text-gray-300 print:text-black print:hidden">Total: {totalCalories.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kkal</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="bg-white/5 text-gray-400 border-b border-white/10 print:bg-gray-100 print:text-black print:border-black print:border-b-2">
            <tr>
              <th className="p-3 text-xs font-medium uppercase tracking-wider text-center border-r border-white/10 print:border-black w-32">CATERING</th>
              <th className="p-3 text-xs font-medium uppercase tracking-wider text-center border-r border-white/10 print:border-black w-48">MENU MAKANAN</th>
              <th className="p-3 text-xs font-medium uppercase tracking-wider text-center border-r border-white/10 print:border-black w-40">CARA PENGOLAHAN</th>
              <th className="p-3 text-xs font-medium uppercase tracking-wider text-center border-r border-white/10 print:border-black">BAHAN MAKANAN</th>
              <th className="p-3 text-xs font-medium uppercase tracking-wider text-center border-r border-white/10 print:border-black w-20 leading-tight">Berat Matang (gr)</th>
              <th className="p-3 text-xs font-medium uppercase tracking-wider text-center border-r border-white/10 print:border-black w-20 leading-tight">Berat Mentah (gr)</th>
              <th className="p-3 text-xs font-medium uppercase tracking-wider text-center border-r border-white/10 print:border-black w-16 leading-tight">BDD (%)</th>
              <th className="p-3 text-xs font-medium uppercase tracking-wider text-center print:border-black w-20 leading-tight bg-green-900/20 print:bg-transparent">Kalori (kkal)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 print:divide-black text-sm text-gray-300 print:text-black">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500 animate-pulse">
                  Memuat data...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500 italic">
                  Tidak ada menu untuk sesi ini.
                </td>
              </tr>
            ) : (
              <>
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors print:hover:bg-transparent">
                    {row.cateringRowSpan > 0 && (
                      <td rowSpan={row.cateringRowSpan} className="p-3 border-r border-white/10 print:border-black font-semibold text-white print:text-black text-center align-middle bg-white/5 print:bg-white">
                        {row.cateringName}
                      </td>
                    )}
                    {row.cateringRowSpan === 0 && null}

                    {row.dishRowSpan > 0 && (
                      <td rowSpan={row.dishRowSpan} className="p-3 border-r border-white/10 print:border-black font-medium text-white print:text-black align-middle">
                        {row.dishName}
                      </td>
                    )}

                    <td className="p-2 border-r border-white/10 print:border-black">{row.ingredient.conversion?.food_name || <span className="text-gray-500 italic">Faktor: {row.ingredient.conversion_factor}</span>}</td>
                    <td className="p-2 border-r border-white/10 print:border-black">{row.ingredient.ingredient_name}</td>
                    <td className="p-2 border-r border-white/10 print:border-black text-center font-mono text-xs">{row.ingredient.weight_cooked}</td>
                    <td className="p-2 border-r border-white/10 print:border-black text-center font-mono text-xs">{row.ingredient.weight_raw}</td>
                    <td className="p-2 border-r border-white/10 print:border-black text-center font-mono text-xs">{row.ingredient.bdd_percent}</td>
                    <td className="p-2 text-right font-mono text-xs text-green-400 print:text-black bg-green-900/10 print:bg-transparent">{row.calories > 0 ? row.calories.toLocaleString("id-ID", { maximumFractionDigits: 1 }) : "-"}</td>
                  </tr>
                ))}
                <tr className="bg-gray-800/50 print:bg-gray-300 font-bold border-t-2 border-white/20 print:border-black">
                  <td colSpan={7} className="p-3 text-right text-white print:text-black border-r border-white/10 print:border-black uppercase tracking-wider">
                    Total Kalori {title}
                  </td>
                  <td className="p-3 text-right text-green-400 print:text-black font-mono text-sm">{totalCalories.toLocaleString("id-ID", { maximumFractionDigits: 1 })}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DailyMenuReportPage() {
  const [caterings, setCaterings] = useState<{ id: number; name: string }[]>([]);
  const [selectedCateringId, setSelectedCateringId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const [dataPagi, setDataPagi] = useState<FlatRow[]>([]);
  const [dataSiang, setDataSiang] = useState<FlatRow[]>([]);
  const [dataMalam, setDataMalam] = useState<FlatRow[]>([]);

  // Metadata states (ID & Compliance)
  const [metaPagi, setMetaPagi] = useState<MenuMeta | null>(null);
  const [metaSiang, setMetaSiang] = useState<MenuMeta | null>(null);
  const [metaMalam, setMetaMalam] = useState<MenuMeta | null>(null);

  const [loading, setLoading] = useState(false);

  // Fetch Caterings
  useEffect(() => {
    async function fetchCaterings() {
      const { data } = await supabase.from("caterings").select("id, name").order("name");
      if (data && data.length > 0) {
        setCaterings(data);
        setSelectedCateringId(data[0].id);
      }
    }
    fetchCaterings();
  }, []);

  // Fetch All Report Data
  useEffect(() => {
    if (!selectedCateringId) return;

    fetchReport();
  }, [selectedDate, selectedCateringId]);

  async function fetchReport() {
    setLoading(true);
    const { data, error } = await supabase
      .from("daily_menus")
      .select(
        `
        id, 
        meal_time,
        is_compliant,
        catering:caterings(name), 
        dishes:menu_dishes(
          name, 
          ingredients:dish_ingredients(
            ingredient_name,
            weight_cooked, 
            weight_raw, 
            bdd_percent, 
            conversion_factor,
            conversion:conversion_factors(food_name),
            ingredients_library ( energy_kcal )
          )
        )
      `
      )
      .eq("date", selectedDate)
      .eq("catering_id", selectedCateringId);

    if (error) {
      console.error("Error fetching report:", error);
      setLoading(false);
      return;
    }

    if (!data) {
      setDataPagi([]);
      setDataSiang([]);
      setDataMalam([]);
      setMetaPagi(null);
      setMetaSiang(null);
      setMetaMalam(null);
      setLoading(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processMenus = (menus: any[]) => {
      const flatRows: FlatRow[] = [];
      let meta: MenuMeta | null = null;

      if (menus.length > 0) {
        // Assume 1 menu per session for this catering
        meta = { id: menus[0].id, isCompliant: menus[0].is_compliant ?? true };
      }

      menus.forEach((menu) => {
        const cateringName = menu.catering?.name || "Unknown Catering";
        const dishes = menu.dishes || [];

        const cateringStartIndex = flatRows.length;
        let totalCateringRows = 0;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dishes.forEach((dish: any) => {
          const ingredients = dish.ingredients || [];
          if (ingredients.length === 0) return;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ingredients.forEach((ing: any, ingIndex: number) => {
            const energy = ing.ingredients_library?.energy_kcal || 0;
            const calories = calculateCalories(ing.weight_raw, ing.bdd_percent, energy);

            flatRows.push({
              cateringName,
              dishName: dish.name,
              ingredient: ing,
              cateringRowSpan: 0,
              dishRowSpan: ingIndex === 0 ? ingredients.length : 0,
              calories,
            });
          });

          totalCateringRows += ingredients.length;
        });

        if (totalCateringRows > 0) {
          flatRows[cateringStartIndex].cateringRowSpan = totalCateringRows;
        }
      });
      return { rows: flatRows, meta };
    };

    // Filter and process individual meal times
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultPagi = processMenus((data as any[]).filter((m) => m.meal_time === "Pagi"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultSiang = processMenus((data as any[]).filter((m) => m.meal_time === "Siang"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultMalam = processMenus((data as any[]).filter((m) => m.meal_time === "Malam"));

    setDataPagi(resultPagi.rows);
    setMetaPagi(resultPagi.meta);
    setDataSiang(resultSiang.rows);
    setMetaSiang(resultSiang.meta);
    setDataMalam(resultMalam.rows);
    setMetaMalam(resultMalam.meta);

    setLoading(false);
  }

  // Toggle Handler
  const handleToggleCompliance = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    // Optimistic Update
    if (metaPagi?.id === id) setMetaPagi((prev) => (prev ? { ...prev, isCompliant: newStatus } : null));
    if (metaSiang?.id === id) setMetaSiang((prev) => (prev ? { ...prev, isCompliant: newStatus } : null));
    if (metaMalam?.id === id) setMetaMalam((prev) => (prev ? { ...prev, isCompliant: newStatus } : null));

    const { error } = await supabase.from("daily_menus").update({ is_compliant: newStatus }).eq("id", id);

    if (error) {
      console.error("Failed to update compliance:", error);
      // Revert (could be improved with better state management, but sufficient for now)
      fetchReport();
    }
  };

  const isCateringSelected = selectedCateringId !== null;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-white">Laporan Detail Menu Harian</h2>
          <p className="text-gray-400 mt-1">Komposisi bahan makanan, nilai kalori, dan validasi menu</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-800 text-white text-sm border border-gray-700 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none hover:bg-gray-700 transition-colors"
          />
          <button onClick={() => window.print()} className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium" title="Cetak Laporan">
            <PrinterIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* Catering Tabs */}
      <div className="border-b border-white/10 print:hidden">
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

      {!isCateringSelected && <div className="p-8 text-center text-gray-400">Silakan pilih catering terlebih dahulu.</div>}

      {/* Tables Container */}
      <div className="space-y-8 print:space-y-8">
        <ReportTable title="MENU PAGI" rows={dataPagi} loading={loading} menuMeta={metaPagi} onToggleCompliance={handleToggleCompliance} />
        <ReportTable title="MENU SIANG" rows={dataSiang} loading={loading} menuMeta={metaSiang} onToggleCompliance={handleToggleCompliance} />
        <ReportTable title="MENU MALAM" rows={dataMalam} loading={loading} menuMeta={metaMalam} onToggleCompliance={handleToggleCompliance} />

        {/* Daily Total Summary */}
        <div className="mt-8 p-4 rounded-xl border border-green-500/20 bg-green-500/10 print:bg-gray-100 print:text-black print:border-black text-right break-inside-avoid shadow-lg">
          <span className="text-lg font-bold text-green-400 print:text-black uppercase mr-4">Total Kalori Harian:</span>
          <span className="text-2xl font-bold text-white print:text-black font-mono">
            {(dataPagi.reduce((sum, r) => sum + r.calories, 0) + dataSiang.reduce((sum, r) => sum + r.calories, 0) + dataMalam.reduce((sum, r) => sum + r.calories, 0)).toLocaleString("id-ID", { maximumFractionDigits: 1 })} kkal
          </span>
        </div>
      </div>

      <p className="text-gray-400 text-xs text-right print:hidden">* Status 'Sesuai Standar' hanya untuk keperluan analitik internal</p>
    </div>
  );
}
