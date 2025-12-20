import { useState } from 'react';
import {
  Clock,
  Plus,
  Edit,
  Trash,
  Check,
  User,
  MessageCircle,
  Repeat,
  Archive,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useMyActivities } from '../../hooks/useActivities';

// ========================
// CONFIG
// ========================

const LIMIT = 50;

const activityTypeMap = {
  task: 'Công việc',
  project: 'Dự án',
  team: 'Nhóm',
};

const typeColors = {
  task: 'bg-blue-100 text-blue-800',
  project: 'bg-green-100 text-green-800',
  team: 'bg-purple-100 text-purple-800',
  default: 'bg-gray-100 text-gray-800',
};

// ========================
// HELPERS
// ========================

const getActionIcon = (action) => {
  if (!action) return '📝';
  const a = action.toLowerCase();
  const iconProps = { className: 'w-5 h-5' };

  if (a.includes('tạo')) return <Plus {...iconProps} />;
  if (a.includes('cập nhật')) return <Edit {...iconProps} />;
  if (a.includes('xóa')) return <Trash {...iconProps} />;
  if (a.includes('hoàn thành')) return <Check {...iconProps} />;
  if (a.includes('thêm')) return <User {...iconProps} />;
  if (a.includes('bình luận')) return <MessageCircle {...iconProps} />;
  if (a.includes('di chuyển')) return <Repeat {...iconProps} />;
  if (a.includes('lưu trữ')) return <Archive {...iconProps} />;

  return '📝';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const diff = Math.floor((Date.now() - date) / 1000);

  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ========================
// COMPONENT
// ========================

const UserActivitiesTimeline = () => {
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError, error } = useMyActivities({
    related_type: filter === 'all' ? undefined : filter,
    page: currentPage,
    limit: LIMIT,
  });

  const activities = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;
  const totalActivities = data?.pagination?.total || activities.length;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Nhật ký hoạt động
      </h1>
      <p className="text-gray-500 mb-6">
        Timeline trực quan các hoạt động của bạn
      </p>

      {/* Filter */}
      <div className="flex gap-2 mb-8">
        {['all', 'task', 'project', 'team'].map((type) => (
          <button
            key={type}
            onClick={() => {
              setFilter(type);
              setCurrentPage(1);
            }}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === type
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {type === 'all' ? 'Tất cả' : activityTypeMap[type]}
          </button>
        ))}
      </div>

      {/* Total */}
      {!isLoading && !isError && totalActivities > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Tổng số:{' '}
          <span className="font-semibold">{totalActivities}</span> hoạt động
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-10 w-10 border-b-2 border-blue-500 rounded-full"></div>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 font-medium">
          ❌ {error?.message || 'Có lỗi xảy ra'}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && activities.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-xl">
          📭 Chưa có hoạt động nào
        </div>
      )}

      {/* Timeline */}
      {!isLoading && !isError && activities.length > 0 && (
        <>
          <div className="relative before:absolute before:left-4 before:top-0 before:h-full before:w-0.5 before:bg-gray-200">
            {activities.map((activity) => {
              const type = activity.related_type || 'default';

              return (
                <div
                  key={activity._id}
                  className="relative flex items-start mb-8"
                >
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${typeColors[type]}`}
                  >
                    {getActionIcon(activity.action)}
                  </div>

                  {/* Card */}
                  <div className="ml-6 bg-white p-4 rounded-xl shadow hover:shadow-lg transition-shadow w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800">
                        {activity.action}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[type]}`}
                      >
                        {activityTypeMap[type] || 'Khác'}
                      </span>
                    </div>

                    {activity.related_data && (
                      <p className="text-gray-700 mb-1 truncate">
                        {activity.related_data.name ||
                          activity.related_data.title ||
                          activity.related_data.project_name ||
                          activity.related_data.team_name}
                      </p>
                    )}

                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      {formatDate(activity.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 pb-8">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Trang trước
              </button>

              <span className="text-gray-600">
                Trang{' '}
                <span className="font-bold text-blue-600">
                  {currentPage}
                </span>{' '}
                / {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Trang sau
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserActivitiesTimeline;
