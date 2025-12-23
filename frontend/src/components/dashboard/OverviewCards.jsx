import { Users, FolderKanban, ListTodo } from "lucide-react";

export default function OverviewCards({
  teams = [],
  projects = [],
  tasks = [],
  loading = false,
}) {
  const cards = [
    {
      title: "Nhóm",
      value: loading ? "—" : teams.length,
      icon: <Users size={18} />,
      accent: "bg-blue-500",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Dự án",
      value: loading ? "—" : projects.length,
      icon: <FolderKanban size={18} />,
      accent: "bg-purple-500",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Công việc",
      value: loading ? "—" : tasks.length,
      icon: <ListTodo size={18} />,
      accent: "bg-orange-500",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c, index) => (
        <div
          key={index}
          className="
            relative
            bg-white
            border border-gray-200
            rounded-xl
            px-4 py-3
            transition
            hover:shadow-sm
          "
        >
          {/* Accent bar */}
          <div
            className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${c.accent}`}
          />

          <div className="flex items-center justify-between pl-2">
            {/* Left */}
            <div>
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                {c.title}
              </p>
              <p className="text-3xl font-semibold text-gray-900 leading-none">
                {c.value}
              </p>
            </div>

            {/* Icon */}
            <div
              className={`
                w-10 h-10
                flex items-center justify-center
                rounded-lg
                ${c.iconBg}
                ${c.iconColor}
              `}
            >
              {c.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
