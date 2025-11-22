import React from "react";
import { CheckCircle, X } from "lucide-react";

export default function SuccessDialog({ open, onClose, title = "Thành công", message = "Thao tác hoàn tất." }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-[350px] text-center animate-fadeIn">
        <div className="flex justify-center mb-3">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>

        <h2 className="text-xl font-semibold mb-1">{title}</h2>
        <p className="text-gray-600 mb-4">{message}</p>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition flex items-center justify-center gap-2"
        >
          <X size={18} /> Đóng
        </button>
      </div>
    </div>
  );
}
