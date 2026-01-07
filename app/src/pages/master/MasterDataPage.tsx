import { useState } from "react";
import MasterCateringPage from "./MasterCateringPage";
import MasterTKPIPage from "./MasterTKPIPage";
import MasterConversionFactorsPage from "./MasterConversionFactorsPage";

type TabType = "catering" | "tkpi" | "conversion";

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<TabType>("catering");

  const tabs = [
    { id: "catering" as TabType, name: "Catering", count: null },
    { id: "tkpi" as TabType, name: "TKPI (Bahan Makanan)", count: null },
    { id: "conversion" as TabType, name: "Faktor Konversi", count: null },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Master Data</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola data referensi aplikasi</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-white/10">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors outline-none
                ${activeTab === tab.id ? "border-green-500 text-green-600 dark:text-green-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300"}
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === "catering" && <MasterCateringPage />}
        {activeTab === "tkpi" && <MasterTKPIPage />}
        {activeTab === "conversion" && <MasterConversionFactorsPage />}
      </div>
    </div>
  );
}
