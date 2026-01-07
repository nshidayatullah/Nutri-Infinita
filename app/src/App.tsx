import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import MasterDataPage from "./pages/master/MasterDataPage";
import MenuOverviewPage from "./pages/planning/MenuOverviewPage";
import MenuInputPage from "./pages/planning/MenuInputPage";
import DailyMenuReportPage from "./pages/reports/DailyMenuReportPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="master" element={<MasterDataPage />} />
          <Route path="overview" element={<MenuOverviewPage />} />
          <Route path="input" element={<MenuInputPage />} />
          <Route path="reports/daily" element={<DailyMenuReportPage />} />
          {/* Other routes will be added here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
