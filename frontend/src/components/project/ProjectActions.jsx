import React, { useState, useRef, useEffect } from "react";
import { updateProject, deleteProject } from "../../services/projectService";
import { useNavigate } from "react-router-dom";
import SuccessDialog from "../common/SuccessDialog"; // import dialog

export default function ProjectActions({ project }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const isCreator = project.created_by?._id === userId;

  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({
    project_name: project.project_name,
    description: project.description,
    start_date: project.start_date?.slice(0, 10),
    end_date: project.end_date?.slice(0, 10),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const popupRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowEdit(false);
      }
    }
    if (showEdit) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEdit]);

  if (!isCreator) return null;

  const handleDelete = async () => {
    if (!confirm("Bạn chắc chắn muốn xóa dự án này?")) return;

    try {
      await deleteProject(project._id);
      setDialogMessage("Xóa dự án thành công!");
      setDialogOpen(true);

      // chuyển trang sau 1s để người dùng thấy dialog
      setTimeout(() => navigate("/duan"), 1000);
    } catch (err) {
      setDialogMessage(`Lỗi: ${err.message}`);
      setDialogOpen(true);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateProject(project._id, form);
      setDialogMessage("Cập nhật thành công!");
      setDialogOpen(true);
    } catch (err) {
      setDialogMessage(`Lỗi: ${err.message}`);
      setDialogOpen(true);
    } finally {
      setShowEdit(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-3">
        <button
          onClick={() => setShowEdit(!showEdit)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Sửa dự án
        </button>

        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Xóa dự án
        </button>
      </div>

      {/* Popup form */}
      {showEdit && (
        <div
          ref={popupRef}
          className="absolute right-0 mt-2 w-80 bg-white shadow-xl border rounded-xl p-4 z-50"
        >
          <h3 className="font-semibold mb-2">Chỉnh sửa dự án</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Tên dự án</label>
              <input
                type="text"
                className="border rounded-lg p-2 w-full"
                value={form.project_name}
                onChange={(e) =>
                  setForm({ ...form, project_name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Mô tả</label>
              <textarea
                className="border rounded-lg p-2 w-full"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Ngày bắt đầu</label>
              <input
                type="date"
                className="border rounded-lg p-2 w-full"
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Ngày kết thúc</label>
              <input
                type="date"
                className="border rounded-lg p-2 w-full"
                value={form.end_date}
                onChange={(e) =>
                  setForm({ ...form, end_date: e.target.value })
                }
              />
            </div>

            <button
              onClick={handleUpdate}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}

      {/* SuccessDialog */}
      <SuccessDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        message={dialogMessage}
      />
    </div>
  );
}
