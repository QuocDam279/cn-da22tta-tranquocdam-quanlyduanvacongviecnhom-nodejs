import React, { useState } from "react";
import Menu from "../components/common/Menu";
import Header from "../components/common/Header";
import OverviewCards from "../components/dashboard/OverviewCards";
import ProjectList from "../components/dashboard/ProjectList";
import ActivityLog from "../components/dashboard/ActivityLog";
import Calendar from "../components/dashboard/Calendar";
import Status from "../components/dashboard/Status";

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);

  // Chiều rộng sidebar theo trạng thái
  const sidebarWidth = collapsed ? "4rem" : "16rem";

  return (
    <div className="bg-white min-h-screen flex">
      {/* Menu */}
      <Menu collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <Header collapsed={collapsed} sidebarWidth={sidebarWidth} />

        {/* Content */}
        <div
          className="pt-24 px-6 space-y-8 transition-all duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          <OverviewCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl shadow">
              <ProjectList />
            </div>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow">
                <ActivityLog />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow">
                <Status />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <Calendar />
          </div>
        </div>
      </div>
    </div>
  );
}
