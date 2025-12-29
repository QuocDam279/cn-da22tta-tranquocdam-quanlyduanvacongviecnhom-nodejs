import React, { useState } from "react";
import { Plus, X, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateProject } from "../../hooks/useProjects";

export default function CreateProjectButton({ teamId, onCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    start_date: "",
    end_date: "",
  });
  const [error, setError] = useState("");

  const createProjectMutation = useCreateProject();
  const loading = createProjectMutation.isPending;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // --- 1. Validate Tên dự án ---
    if (!formData.project_name.trim()) {
      setError("Tên dự án không được bỏ trống");
      toast.error("Vui lòng nhập tên dự án", { duration: 2000 });
      return;
    }

    // --- 2. Validate Ngày bắt đầu (MỚI) ---
    if (!formData.start_date) {
      setError("Vui lòng chọn ngày bắt đầu");
      toast.error("Vui lòng chọn ngày bắt đầu", { duration: 2000 });
      return;
    }

    // --- 3. Validate Ngày kết thúc (MỚI) ---
    if (!formData.end_date) {
      setError("Vui lòng chọn ngày kết thúc");
      toast.error("Vui lòng chọn ngày kết thúc", { duration: 2000 });
      return;
    }

    // --- 4. Validate Logic ngày tháng (Ngày kết thúc phải sau ngày bắt đầu) ---
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError("Ngày kết thúc không thể trước ngày bắt đầu");
      toast.error("Ngày kết thúc không hợp lệ", { duration: 2000 });
      return;
    }

    const loadingToast = toast.loading("Đang tạo dự án...");

    try {
      const res = await createProjectMutation.mutateAsync({
        team_id: teamId,
        project_name: formData.project_name,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
      });

      toast.dismiss(loadingToast);
      toast.success(
        `Tạo dự án thành công`,
        {
          duration: 3000,
          icon: "🚀",
        }
      );

      // Reset form
      setFormData({
        project_name: "",
        description: "",
        start_date: "",
        end_date: "",
      });
      setShowForm(false);
      setError("");

      if (onCreated) onCreated(res.project);
    } catch (err) {
      toast.dismiss(loadingToast);
      const errorMsg = err.message || "Tạo dự án thất bại";
      setError(errorMsg);
      toast.error(errorMsg, { duration: 2000 });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating button */}
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
      >
        <Plus size={18} />
        Tạo dự án
      </button>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-[100]">
          <div className="w-full max-w-md bg-white h-full shadow-xl overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-200 sticky top-0 bg-white">
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-xl font-semibold">Tạo dự án</h2>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6">
                Các trường bắt buộc được đánh dấu bằng dấu <span className="text-red-500">*</span>
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên dự án <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="project_name"
                    value={formData.project_name}
                    onChange={handleChange}
                    placeholder="Nhập tên dự án"
                    disabled={loading}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Nhập mô tả dự án"
                    disabled={loading}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {/* Thêm dấu sao đỏ */}
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                    />
                  </div>

                  <div>
                    {/* Thêm dấu sao đỏ */}
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setError("");
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                    disabled={loading}
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Tạo dự án
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}