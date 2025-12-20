// src/components/dashboard/ActivityLog.jsx (hoặc UserActivities.jsx)
import { useActivities } from '../../hooks/useDashboardData';
import { Clock } from 'lucide-react';

const UserActivities = ({ activities, loading }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-2">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">Nhật ký hoạt động</h1>

      {loading && <p className="text-gray-500 animate-pulse">Đang tải...</p>}
      
      {!loading && activities.length === 0 && (
        <p className="text-gray-500">Chưa có hoạt động nào</p>
      )}

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity._id || index}
            className="flex items-start bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex-1">
              <p className="text-gray-500 font-medium">{activity.action}</p>
              <div className="flex items-center mt-1 text-sm text-blue-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>{formatDate(activity.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserActivities;