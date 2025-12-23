import React, { useState, useMemo } from "react";
import Header from "../components/common/Header";
import OverviewCards from "../components/dashboard/OverviewCards";
import ActivityLog from "../components/activity/UserActivities";
import Footer from "../components/common/Footer";
import Calendar from "../components/dashboard/Calendar";
import Status from "../components/dashboard/Status";
import UpcomingTasks from "../components/dashboard/UpcomingTasks";
import UpcomingProjects from "../components/dashboard/UpcomingProjects";
import Project from "./Project";
import Task from "./Task";
import { useDashboardData } from "../hooks/useDashboardData";

/* ================= TAB CONFIG ================= */
const TABS = [
  { key: "overview", label: "Tổng quan", icon: "📊" },
  { key: "calendar", label: "Lịch", icon: "📅" },
  { key: "tasks", label: "Công việc", icon: "✓" },
  { key: "activities", label: "Hoạt động", icon: "⚡" },
];

/* ================= DEADLINE LOGIC ================= */
const isUpcomingTask = (task, days = 3) => {
  if (!task.due_date || task.status === "Done") return false;
  const now = new Date();
  const due = new Date(task.due_date);
  const diffDays = (due - now) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
};

const isUpcomingProject = (project, days = 7) => {
  if (!project.end_date || project.progress === 100) return false;
  const now = new Date();
  const end = new Date(project.end_date);
  const diffDays = (end - now) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
};

/* ================= COMPONENT ================= */
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { tasks, teams, projects, activities, loading } = useDashboardData();

  /* ===== Upcoming ===== */
  const upcomingTasks = useMemo(
    () => tasks.filter((t) => isUpcomingTask(t, 3)),
    [tasks]
  );

  const upcomingProjects = useMemo(
    () => projects.filter((p) => isUpcomingProject(p, 7)),
    [projects]
  );

  /* ================= OVERVIEW TAB ================= */
  const renderOverviewTab = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* ===== ROW 1: STATUS & DEADLINES (3 Columns) ===== */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-800">
              Tổng quan tiến độ
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* 1. STATUS CHART */}
            <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
              <Status workItems={tasks} />
            </div>

            {/* 2. UPCOMING TASKS */}
            <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⏰</span>
                <h4 className="font-bold text-gray-800">
                  Công việc sắp đến hạn
                </h4>
              </div>
              <div className="overflow-y-auto max-h-96 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <UpcomingTasks tasks={upcomingTasks} />
              </div>
            </div>

            {/* 3. UPCOMING PROJECTS */}
            <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🚀</span>
                <h4 className="font-bold text-gray-800">
                  Dự án sắp đến hạn
                </h4>
              </div>
              <div className="overflow-y-auto max-h-96 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <UpcomingProjects projects={upcomingProjects} />
              </div>
            </div>
          </div>
        </section>

        {/* ===== ROW 2: PROJECT LIST (Full Width) ===== */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-800">Danh sách Dự án</h3>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <Project />
          </div>
        </section>
      </div>
    );
  };

  /* ================= TAB CONTENT ================= */
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverviewTab();

      case "tasks":
        return (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <Task />
          </div>
        );

      case "calendar":
        return (
          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
            <Calendar tasks={tasks} />
          </div>
        );

      case "activities":
        return (
          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
            <ActivityLog activities={activities} loading={loading} />
          </div>
        );

      default:
        return null;
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex flex-col">
      {/* HEADER */}
      <Header />

      {/* CONTENT - Tự động chiếm không gian còn lại */}
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* OVERVIEW CARDS */}
        <div className="transition-opacity duration-500">
          <OverviewCards
            teams={teams}
            projects={projects}
            tasks={tasks}
            loading={loading}
          />
        </div>

        {/* TABS */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white overflow-x-auto">
            {TABS.map((tab, index) => (
              <React.Fragment key={tab.key}>
                <button
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-6 py-4 text-sm font-semibold transition-all duration-300 whitespace-nowrap
                    ${
                      activeTab === tab.key
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    {tab.label}
                  </span>
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full"></div>
                  )}
                </button>
                {index < TABS.length - 1 && (
                  <div className="w-px bg-gray-200 my-3"></div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 lg:p-8 transition-opacity duration-500">
            {renderTabContent()}
          </div>
        </div>
      </main>

      {/* FOOTER - Luôn ở dưới cùng */}
      <Footer />
    </div>
  );
}