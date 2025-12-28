import React from "react";
import { Grid, List } from "lucide-react";

export default function ViewToggle({ view, setView }) {
  return (
    <div className="flex justify-end mb-4 gap-2">
      <button
        onClick={() => setView("grid")}
        className={`p-2 border rounded ${view === "grid" ? "border-blue-600" : ""}`}
      >
        <Grid size={18} />
      </button>
      <button
        onClick={() => setView("list")}
        className={`p-2 border rounded ${view === "list" ? "border-blue-600" : ""}`}
      >
        <List size={18} />
      </button>
    </div>
  );
}
