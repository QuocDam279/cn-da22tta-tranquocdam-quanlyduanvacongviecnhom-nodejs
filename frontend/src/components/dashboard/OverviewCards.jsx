import { Users, FolderKanban, ListTodo, AlarmClock } from "lucide-react";

export default function OverviewCards({
  teams = [],
  projects = [],
  tasks = [],
  loading = false,
}) {
  const teamCount = teams.length;
  const projectCount = projects.length;
  const taskCount = tasks.length;

  // 🔥 Sắp đến hạn (3 ngày)
  const now = new Date();
  const limit = new Date();
  limit.setDate(limit.getDate() + 3);

  const upcomingCount = tasks.filter((t) => {
    if (!t.due_date) return false;
    const date = new Date(t.due_date);
    return date >= now && date <= limit && t.status !== "Đã hoàn thành";
  }).length;

  const cards = [
    {
      title: "Nhóm",
      value: loading ? "…" : teamCount,
      icon: <Users size={20} />,
      color: "bg-blue-500",
    },
    {
      title: "Dự án",
      value: loading ? "…" : projectCount,
      icon: <FolderKanban size={20} />,
      color: "bg-green-500",
    },
    {
      title: "Công việc",
      value: loading ? "…" : taskCount,
      icon: <ListTodo size={20} />,
      color: "bg-orange-500",
    },
    {
      title: "Sắp đến hạn",
      value: loading ? "…" : upcomingCount,
      icon: <AlarmClock size={20} />,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.title}
          className="bg-white p-4 rounded-xl shadow flex items-center gap-3 hover:shadow-md transition"
        >
          <div className={`${c.color} text-white p-2 rounded-lg`}>
            {c.icon}
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800">{c.value}</div>
            <div className="text-sm text-slate-500">{c.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
