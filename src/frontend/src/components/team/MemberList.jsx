// components/team/MemberList.jsx
import React from "react";
import { Users, User } from "lucide-react";

export default function MemberList({ members }) {
  if (!members || members.length === 0) return <p>Chưa có thành viên</p>;

  return (
    <div className="space-y-2">
      {members.map((m) => (
        <div
          key={m.user?._id || m._id}
          className="flex items-center justify-between border px-3 py-2 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Users className="text-purple-500" />
            <div>
              <p className="font-medium">{m.user?.full_name || "Unknown"}</p>
              <p className="text-gray-600 text-sm">{m.user?.email || "-"}</p>
            </div>
          </div>
          <User className="text-gray-700" />
        </div>
      ))}
    </div>
  );
}
