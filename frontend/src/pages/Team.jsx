import React from "react";
import Header from "../components/common/Header";
import DashboardTeam from "../components/team/DashboardTeam";

export default function Team() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <Header />

      {/* Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <DashboardTeam />
      </main>
    </div>
  );
}