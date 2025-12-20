// ========================================
// 2. ProfileTabs.jsx - IMPROVED
// ========================================
import React from "react";
import { User, Lock } from "lucide-react";

const tabs = [
  { id: "general", label: "Thông tin chung", icon: User },
  { id: "security", label: "Bảo mật", icon: Lock },
];

export default function ProfileTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex gap-2 border-b-2 border-gray-200 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all relative rounded-t-xl
              ${
                isActive
                  ? "text-blue-600 bg-gradient-to-b from-blue-50 to-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            <Icon size={18} />
            {tab.label}

            {/* Active indicator */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full"></span>
            )}
          </button>
        );
      })}
    </div>
  );
}
