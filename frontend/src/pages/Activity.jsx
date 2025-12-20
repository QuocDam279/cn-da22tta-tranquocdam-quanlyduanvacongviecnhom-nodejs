import { useState } from "react";
import UserActivities from "../components/activity/UserActivities";

export default function Team() {
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? "4rem" : "16rem";

  return (
    <div
      className="transition-all duration-300"
      style={{ marginLeft: sidebarWidth }}
    >
      <UserActivities />
    </div>
  );
}
