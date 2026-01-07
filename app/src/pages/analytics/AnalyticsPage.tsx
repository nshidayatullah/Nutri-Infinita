import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { ChartBarIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMenus: 0,
    compliantMenus: 0,
    complianceRate: 0,
    nonCompliantMenus: 0,
    avgCalories: 0,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentIssues, setRecentIssues] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);

      // Fetch all daily menus for stats
      // Limit to last 30 days for relevance
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: menus, error } = await supabase
        .from("daily_menus")
        .select(
          `
            id, date, meal_time, is_compliant, compliance_note,
            catering:caterings(name),
            dishes:menu_dishes(
                ingredients:dish_ingredients(
                    weight_raw, bdd_percent,
                    ingredients_library(energy_kcal)
                )
            )
        `
        )
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
        .order("date", { ascending: false });

      if (error) {
        console.error("Error loading analytics:", error);
        setLoading(false);
        return;
      }

      if (menus) {
        const total = menus.length;
        const compliant = menus.filter((m) => m.is_compliant !== false).length; // Default true if null
        const nonCompliant = total - compliant;
        const rate = total > 0 ? (compliant / total) * 100 : 100;

        // Calculate Average Calories
        let totalCaloriesSum = 0;
        let menusWithCalories = 0;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        menus.forEach((menu: any) => {
          let menuCal = 0;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          menu.dishes?.forEach((dish: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dish.ingredients?.forEach((ing: any) => {
              const energy = ing.ingredients_library?.energy_kcal || 0;
              const cal = ((ing.weight_raw * (ing.bdd_percent / 100)) / 100) * energy;
              menuCal += cal;
            });
          });

          if (menuCal > 0) {
            totalCaloriesSum += menuCal;
            menusWithCalories++;
          }
        });

        const avgCal = menusWithCalories > 0 ? totalCaloriesSum / menusWithCalories : 0;

        setStats({
          totalMenus: total,
          compliantMenus: compliant,
          complianceRate: Math.round(rate),
          nonCompliantMenus: nonCompliant,
          avgCalories: Math.round(avgCal),
        });

        // Filter issues
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const issues = menus.filter((m: any) => m.is_compliant === false).slice(0, 10);
        setRecentIssues(issues);
      }

      setLoading(false);
    }

    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analitik Kinerja Menu</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Laporan kinerja dan kepatuhan standar gizi (30 Hari Terakhir)</p>
      </div>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-gray-500">Menghitung data statistik...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Compliance Rate */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tingkat Kepatuhan</p>
                  <h3 className={`text-3xl font-bold mt-2 ${stats.complianceRate >= 80 ? "text-green-600" : "text-red-500"}`}>{stats.complianceRate}%</h3>
                </div>
                <div className={`p-3 rounded-xl ${stats.complianceRate >= 80 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                  {stats.complianceRate >= 80 ? <CheckCircleIcon className="w-6 h-6" /> : <ExclamationTriangleIcon className="w-6 h-6" />}
                </div>
              </div>
            </div>

            {/* Total Menus */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Menu Disajikan</p>
                  <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalMenus}</h3>
                </div>
                <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                  <CalendarDaysIcon className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Avg Calories */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rata-rata Kalori/Sesi</p>
                  <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                    {stats.avgCalories} <span className="text-sm font-normal text-gray-500">kkal</span>
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                  <ChartBarIcon className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Issues Count */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ketidaksesuaian</p>
                  <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{stats.nonCompliantMenus}</h3>
                </div>
                <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                  <XCircleIcon className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Issues List */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Daftar Menu Tidak Sesuai (Recent)</h3>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
              {recentIssues.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-2 opacity-50" />
                  <p>Bagus! Semua menu sesuai standar.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Waktu</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Catering</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                      {recentIssues.map((issue) => (
                        <tr key={issue.id} className="hover:bg-gray-50 dark:hover:bg-white/5 bg-red-50/50 dark:bg-red-900/10">
                          <td className="p-4 font-mono text-sm text-gray-700 dark:text-gray-300">{issue.date}</td>
                          <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{issue.meal_time}</td>
                          <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{issue.catering?.name}</td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Tidak Sesuai</span>
                          </td>
                          <td className="p-4 text-sm text-gray-500 italic">{issue.compliance_note || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
