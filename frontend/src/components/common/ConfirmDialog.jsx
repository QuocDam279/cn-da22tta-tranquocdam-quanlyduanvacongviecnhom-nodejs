import React from "react";
import ReactDOM from "react-dom";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  const theme = isDangerous
    ? {
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        confirmBtn:
          "bg-red-600 hover:bg-red-700 focus:ring-red-300",
      }
    : {
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        confirmBtn:
          "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300",
      };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={!isLoading ? onCancel : undefined}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_12px_32px_rgba(0,0,0,0.15)]">
        {/* Close */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="flex gap-4">
          {/* Icon */}
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${theme.iconBg}`}
          >
            <AlertTriangle
              size={22}
              className={theme.iconColor}
            />
          </div>

          {/* Text */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-3">
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
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 disabled:opacity-70 ${theme.confirmBtn}`}
          >
            {isLoading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
