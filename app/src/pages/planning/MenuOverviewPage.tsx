import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon } from "@heroicons/react/24/outline";

type Catering = { id: number; name: string };
type DailyMenu = {
  id: number;
  date: string;
  meal_time: string;
  menu_dishes: { id: number; name: string }[];
};

export default function MenuOverviewPage() {
  const navigate = useNavigate();
  const [caterings, setCaterings] = useState<Catering[]>([]);
  const [selectedCateringId, setSelectedCateringId] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [menus, setMenus] = useState<DailyMenu[]>([]);

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

  // Fetch Menus when params change
  useEffect(() => {
    if (!selectedCateringId) return;

    async function fetchMenus() {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      // Calculate start and end date of month
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0]; // Last day of month

      const { data, error } = await supabase
        .from("daily_menus")
        .select(
          `
            id, date, meal_time,
            menu_dishes ( id, name )
        `
        )
        .eq("catering_id", selectedCateringId)
        .gte("date", startDate)
        .lte("date", endDate);

      if (error) console.error("Error fetching menus:", error);
      if (data) setMenus(data);
    }

    fetchMenus();
  }, [selectedCateringId, currentDate]);

  const monthName = currentDate.toLocaleString("id-ID", { month: "long" });
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const mealTimes = ["Pagi", "Snack Pagi", "Siang", "Snack Sore", "Malam"];

  const getMenuForDate = (day: number, mealTime: string) => {
    const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return menus.find((m) => m.date === dateStr && m.meal_time === mealTime);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const navigateToInput = (day: number, mealTime: string) => {
    const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    navigate("/input", { state: { date: dateStr, mealTime } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Rekapitulasi Menu</h2>
          <p className="text-gray-400 mt-1">Status perencanaan menu bulanan</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-lg border border-white/10">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="text-lg font-semibold text-white min-w-[140px] text-center">
            {monthName} {year}
          </span>
          <button onClick={handleNextMonth} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
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

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider w-16 text-center">Tgl</th>
                {mealTimes.map((mt) => (
                  <th key={mt} className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {mt}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {days.map((day) => (
                <tr key={day} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-center font-mono text-gray-400 border-r border-white/5">{String(day).padStart(2, "0")}</td>
                  {mealTimes.map((mt) => {
                    const menu = getMenuForDate(day, mt);
                    const isFilled = menu && menu.menu_dishes && menu.menu_dishes.length > 0;
                    return (
                      <td key={mt} className="p-2 border-r border-white/5 last:border-0 relative group">
                        {/* Cell Content */}
                        <div
                          onClick={() => navigateToInput(day, mt)}
                          className={`
                                                rounded-lg p-2 min-h-[60px] cursor-pointer transition-all border border-transparent
                                                ${isFilled ? "bg-green-500/10 hover:bg-green-500/20 border-green-500/20" : "hover:bg-white/5 border-dashed border-white/10 hover:border-gray-500"}
                                            `}
                        >
                          {isFilled ? (
                            <div className="text-xs">
                              <div className="font-semibold text-green-400 mb-1">✔ Terisi</div>
                              <div className="text-gray-400 line-clamp-2">{menu.menu_dishes.map((d) => d.name).join(", ")}</div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <PencilIcon className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
