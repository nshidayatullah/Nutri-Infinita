import { useState } from "react";
import { BuildingOffice2Icon, BeakerIcon, ArrowPathIcon, ClockIcon } from "@heroicons/react/24/outline";
import MasterCateringPage from "./MasterCateringPage";
import MasterTKPIPage from "./MasterTKPIPage";
import MasterConversionFactorsPage from "./MasterConversionFactorsPage";
import MasterMealTimePage from "./MasterMealTimePage";

type TabType = "catering" | "tkpi" | "conversion" | "meal_time";

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<TabType>("catering");

  const tabs = [
    { id: "catering", name: "Catering", icon: BuildingOffice2Icon },
    { id: "meal_time", name: "Waktu Makan", icon: ClockIcon },
    { id: "tkpi", name: "Bahan Makanan (TKPI)", icon: BeakerIcon },
    { id: "conversion", name: "Faktor Konversi", icon: ArrowPathIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Master Data</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola data referensi sistem</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-white/10">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap outline-none
                ${activeTab === tab.id ? "border-green-500 text-green-600 dark:text-green-400" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200"}
              `}
            >
              <tab.icon
                className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${activeTab === tab.id ? "text-green-500 dark:text-green-400" : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500"}
                `}
                aria-hidden="true"
              />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === "catering" && <MasterCateringPage />}
        {activeTab === "meal_time" && <MasterMealTimePage />}
        {activeTab === "tkpi" && <MasterTKPIPage />}
        {activeTab === "conversion" && <MasterConversionFactorsPage />}
      </div>
    </div>
  );
}
