import React from "react";
import ReactDOM from "react-dom";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn tiếp tục?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  const confirmBtnClass = isDangerous
    ? "bg-red-600 hover:bg-red-700 focus:ring-red-300"
    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300";

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={!isLoading ? onCancel : undefined}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        {/* Close */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isDangerous ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
            }`}
          >
            <AlertTriangle size={20} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 disabled:opacity-70 ${confirmBtnClass}`}
          >
            {isLoading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
