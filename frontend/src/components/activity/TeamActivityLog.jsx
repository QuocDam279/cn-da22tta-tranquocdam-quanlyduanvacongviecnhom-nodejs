import React, { useState } from "react";
import { 
  Clock, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  UserPlus, 
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

// Hook lấy dữ liệu
import { useTeamActivities } from "../../hooks/useActivities";

// --- QUAN TRỌNG: Import UserAvatar từ thư mục common (giống như Header) ---
import UserAvatar from "../common/UserAvatar"; 

// --- CẤU HÌNH CONFIG ---
const ACTION_CONFIG = {
  "đã tạo task": { 
    icon: FileText, 
    color: "text-green-600", 
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  "đã cập nhật task": { 
    icon: Edit3, 
    color: "text-blue-600", 
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  "đã xóa task": { 
    icon: Trash2, 
    color: "text-red-600", 
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  "đã hoàn thành task": { 
    icon: CheckCircle2, 
    color: "text-purple-600", 
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  "đã thêm thành viên": { 
    icon: UserPlus, 
    color: "text-indigo-600", 
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200"
  },
  default: { 
    icon: Clock, 
    color: "text-gray-600", 
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200"
  },
};

// Helper function
const getActionConfig = (action) => ACTION_CONFIG[action] || ACTION_CONFIG.default;

const formatTime = (dateString) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
  } catch (error) {
    return "vừa xong";
  }
};

// --- COMPONENT CON: ACTIVITY ITEM ---
function ActivityItem({ activity }) {
  const config = getActionConfig(activity.action);
  const Icon = config.icon;

  // Lấy thông tin user từ activity (Lưu ý: API phải trả về field user_info)
  const activityUser = activity.user_info || { 
    full_name: "Unknown", 
    avatar: null 
  };

  return (
    <div className="flex gap-4 group hover:bg-gray-50/50 rounded-xl p-4 transition-all duration-200">
      {/* Avatar Section */}
      <div className="flex-shrink-0 relative">
        {/* Sử dụng UserAvatar giống Header */}
        <UserAvatar 
          user={activityUser} 
          className="w-10 h-10 md:w-12 md:h-12 ring-2 ring-white shadow-md border border-gray-100"
        />
        
        {/* Action Icon Badge */}
        <div className={`absolute -bottom-1 -right-1 ${config.bgColor} ${config.borderColor} border-2 rounded-full p-1 shadow-sm`}>
          <Icon size={12} className={config.color} />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 font-medium leading-relaxed">
          <span className="font-semibold text-indigo-900">
            {activityUser.full_name}
          </span>
          {" "}
          <span className="text-gray-600">{activity.action}</span>
          {activity.related_info?.name && (
            <>
              {" "}
              <span className={`font-medium ${config.color}`}>
                "{activity.related_info.name}"
              </span>
            </>
          )}
        </p>
        
        <div className="flex items-center gap-2 mt-1.5">
          <Clock size={12} className="text-gray-400" />
          <time className="text-xs text-gray-500">
            {formatTime(activity.created_at)}
          </time>
          
          {activity.related_info?.type && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500 capitalize px-2 py-0.5 bg-gray-100 rounded-full border border-gray-200">
                {activity.related_info.type}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Component hiển thị khi không có dữ liệu
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100">
        <Clock size={24} className="text-gray-400" />
      </div>
      <p className="text-gray-500 text-sm font-medium">Chưa có hoạt động nào</p>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function TeamActivityLog({ teamId }) {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useTeamActivities(teamId, { page, limit });

  // Pagination Handlers
  const handlePrevPage = () => setPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => {
    if (data?.pagination?.pages && page < data.pagination.pages) {
      setPage((prev) => prev + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-8 text-sm">Không thể tải hoạt động.</div>;
  }

  const activities = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          Hoạt động gần đây
        </h3>
        {pagination.total > 0 && (
          <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100">
            {pagination.total}
          </span>
        )}
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {activities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.map((activity) => (
              <ActivityItem key={activity._id} activity={activity} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-gray-500">
            Trang {pagination.page} / {pagination.pages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextPage}
              disabled={page >= pagination.pages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}