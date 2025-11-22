import React, { useState } from "react";
import { Plus } from "lucide-react";
import { createProject } from "../../services/projectService";

export default function CreateProjectButton({ teamId, onCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    start_date: "",
    end_date: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.project_name.trim()) return setError("Tên dự án không được bỏ trống");

    try {
      setLoading(true);
      const res = await createProject({ team_id: teamId, ...formData });
      setFormData({ project_name: "", description: "", start_date: "", end_date: "" });
      setShowForm(false);
      if (onCreated) onCreated(res.project); // callback để parent cập nhật danh sách
    } catch (err) {
      setError(err.message || "Tạo dự án thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6">
      {/* Nút nổi */}
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        <Plus size={18} />
        Tạo dự án
      </button>

      {/* Form popup */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 relative">
            <h3 className="text-xl font-semibold mb-4">Tạo dự án mới</h3>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleChange}
                placeholder="Tên dự án"
                className="w-full border px-3 py-2 rounded"
                required
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả"
                className="w-full border px-3 py-2 rounded"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-1/2 border px-3 py-2 rounded"
                />
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-1/2 border px-3 py-2 rounded"
                />
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {loading ? "Đang tạo..." : "Tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
