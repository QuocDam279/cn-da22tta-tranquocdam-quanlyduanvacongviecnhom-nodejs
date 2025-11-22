// src/components/common/TabsContainer.jsx
export default function TabsContainer({ tabs, activeTab, onTabChange, children }) {
  return (
    <div className="mt-6">
      <div className="flex space-x-4 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 ${
              activeTab === tab.key
                ? "border-b-2 border-blue-500 font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
