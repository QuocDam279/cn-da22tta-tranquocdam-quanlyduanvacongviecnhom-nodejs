// components/task/TaskStats.jsx
import React from "react";
import { CheckCircle, Clock, ListTodo, Loader } from "lucide-react";

const icons = {
  "To Do": <ListTodo size={28} />,
  "In Progress": <Loader size={28} />,
  Review: <Clock size={28} />,
  Done: <CheckCircle size={28} />,
};

const colors = {
  "To Do": "from-gray-100 to-gray-50",
  "In Progress": "from-blue-100 to-blue-50",
  Review: "from-yellow-100 to-yellow-50",
  Done: "from-green-100 to-green-50",
};

export default function TaskStats({ stats }) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s._id}
          className={`p-5 rounded-2xl shadow bg-gradient-to-br ${colors[s._id]}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white rounded-xl shadow-sm">{icons[s._id]}</div>
            <p className="text-lg font-semibold">{s._id}</p>
          </div>

          <p className="text-gray-600 text-sm">Số lượng: {s.count}</p>
          <p className="text-gray-600 text-sm">
            Tiến độ TB: {s.avgProgress?.toFixed(0) || 0}%
          </p>
        </div>
      ))}
    </div>
  );
}
