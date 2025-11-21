import React from "react";

const sampleLogs = [
  {
    id: 1,
    user: "Jane Smith",
    action: "added a new task",
    time: "2 hours ago",
  },
  {
    id: 2,
    user: "Mark Johnson",
    action: "completed the task 'Design UI'",
    time: "3 hours ago",
  },
  {
    id: 3,
    user: "Lisa White",
    action: "commented on 'Marketing Plan'",
    time: "5 hours ago",
  },
  {
    id: 4,
    user: "QuocDam",
    action: "updated project deadline",
    time: "1 day ago",
  },
];

export default function ActivityLog() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Activity Log</h1>
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        {sampleLogs.map(log => (
          <div
            key={log.id}
            className="border-b pb-4 last:border-none last:pb-0"
          >
            <p className="text-gray-700">
              <span className="font-semibold text-blue-600">{log.user}</span>{" "}
              {log.action}
            </p>
            <p className="text-sm text-gray-500">{log.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}