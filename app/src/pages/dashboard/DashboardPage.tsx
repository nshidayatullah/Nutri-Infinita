import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function DashboardPage() {
  const [tkpiCount, setTkpiCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count, error } = await supabase.from("ingredients_library").select("*", { count: "exact", head: true });

        if (!error && count !== null) {
          setTkpiCount(count);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Nutri Infinita Dashboard</h2>
          <p className="text-gray-400 mt-1">Monitoring menu dan standar AKG harian</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <div className="text-sm font-medium text-gray-400">Total Catering</div>
          <div className="mt-2 text-3xl font-bold text-green-400">4</div>
          <p className="text-xs text-gray-500 mt-1">Terdaftar aktif</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <div className="text-sm font-medium text-gray-400">Total Bahan (TKPI)</div>
          <div className="mt-2 text-3xl font-bold text-yellow-400">{tkpiCount !== null ? tkpiCount : "-"}</div>
          <p className="text-xs text-gray-500 mt-1">Database Bahan Makanan</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <div className="text-sm font-medium text-gray-400">Menu Sesuai</div>
          <div className="mt-2 text-3xl font-bold text-green-400">96%</div>
          <p className="text-xs text-gray-500 mt-1">29 dari 30 hari</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <div className="text-sm font-medium text-gray-400">AKG Standar</div>
          <div className="mt-2 text-3xl font-bold text-blue-400">87%</div>
          <p className="text-xs text-gray-500 mt-1">26 dari 30 hari</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <div className="text-sm font-medium text-gray-400">Target Harian</div>
          <div className="mt-2 text-3xl font-bold text-white">850</div>
          <p className="text-xs text-gray-500 mt-1">kkal per menu</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Aksi Cepat</h3>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => (window.location.href = "/input")} // Use simple navigation or hook if available
            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-colors"
          >
            + Input Menu Hari Ini
          </button>
          <button
            onClick={() => (window.location.href = "/overview")}
            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            📋 Lihat Rekap Menu
          </button>
          <button
            onClick={() => (window.location.href = "/master")}
            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Kelola Data Master
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Aktivitas Terkini</h3>
        <div className="text-center py-12 text-gray-400">
          <p>Belum ada data menu hari ini.</p>
          <p className="text-sm mt-2">Mulai input menu untuk melihat analisis gizi.</p>
        </div>
      </div>
    </div>
  );
}
