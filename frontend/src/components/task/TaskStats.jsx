import React from "react";

export default function TaskStats({ stats }) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-3 mb-4">
      {stats.map((s) => (
        <div
          key={s._id}
          className="border p-3 rounded shadow text-center bg-gray-50"
        >
          <p className="font-semibold">{s._id}</p>
          <p>Số lượng: {s.count}</p>
          <p>Tiến độ TB: {s.avgProgress?.toFixed(0) || 0}%</p>
        </div>
      ))}
    </div>
  );
}
