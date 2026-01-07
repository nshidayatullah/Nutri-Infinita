import { useNavigate } from "react-router-dom";
import { ChartBarIcon, CalendarIcon, UserGroupIcon, ClockIcon, PlusIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const navigate = useNavigate();

  const stats = [
    { name: "Total Catering", stat: "3", icon: UserGroupIcon, color: "bg-blue-500" },
    { name: "Menu Hari Ini", stat: "12", icon: ClockIcon, color: "bg-green-500" },
    { name: "Kebutuhan Kalori", stat: "2100 kkal", icon: ChartBarIcon, color: "bg-purple-500" },
  ];

  const quickActions = [
    {
      name: "Input Menu Hari Ini",
      desc: "Input menu baru untuk catering hari ini",
      href: "/input",
      icon: PlusIcon,
      color: "from-green-400 to-emerald-600",
    },
    {
      name: "Lihat Laporan Harian",
      desc: "Cek detail nutrisi dan kalori harian",
      href: "/reports/daily",
      icon: DocumentTextIcon,
      color: "from-blue-400 to-indigo-600",
    },
    {
      name: "Rekap Menu Bulanan",
      desc: "Monitoring status perencanaan menu sebulan",
      href: "/overview",
      icon: CalendarIcon,
      color: "from-purple-400 to-pink-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nutri Infinita Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitoring menu dan standar AKG harian</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div key={item.name} className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 transition-all hover:shadow-md">
            <dt>
              <div className={`absolute rounded-xl ${item.color} p-3 shadow-lg opacity-90`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.stat}</p>
            </dd>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4">Akses Cepat</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={() => navigate(action.href)}
              className="group relative flex flex-col items-start p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 hover:ring-green-500/50 dark:hover:ring-green-500/50 transition-all text-left hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{action.name}</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
