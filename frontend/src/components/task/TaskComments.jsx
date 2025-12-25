import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Send, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTaskComments, useCreateComment, useDeleteComment } from "../../hooks/useTaskComments";
import UserAvatar from "../common/UserAvatar";

export default function TaskComments({ task, currentUser }) {
  const [content, setContent] = useState("");
  
  // Load danh sách comment
  const { data: comments = [], isLoading } = useTaskComments(task._id);
  
  // Các hooks mutation
  const createMutation = useCreateComment();
  const deleteMutation = useDeleteComment();

  // Xử lý gửi comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      // Gọi mutation (UI sẽ cập nhật ngay nhờ Optimistic Update bên hook)
      await createMutation.mutateAsync({ taskId: task._id, content });
      setContent(""); // Xóa ô nhập ngay
    } catch (error) {
      toast.error(error.message || "Không thể gửi bình luận");
    }
  };

  // Xử lý xóa comment (Đã bỏ alert xác nhận)
  const handleDelete = async (commentId) => {
    // Đã xóa dòng: if (!window.confirm("Bạn muốn xóa bình luận này?")) return;
    
    try {
      await deleteMutation.mutateAsync({ commentId, taskId: task._id });
      toast.success("Đã xóa bình luận");
    } catch (error) {
      toast.error(error.message || "Xóa thất bại");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Danh sách Comments */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <p className="text-center text-gray-400 text-xs py-8">Đang tải...</p>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-400 text-xs py-8">
            Chưa có bình luận.<br/>Hãy là người đầu tiên!
          </div>
        ) : (
          comments.map((comment) => {
            // Kiểm tra quyền xóa (so sánh ID)
            const isOwner = comment.user_id === currentUser?._id || 
                            comment.user?._id === currentUser?._id;
            
            return (
              <div key={comment._id} className={`flex gap-2 group ${comment.isOptimistic ? 'opacity-70' : ''}`}>
                
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <UserAvatar 
                    user={comment.user} 
                    className="w-7 h-7 rounded-full border border-gray-200" 
                  />
                </div>

                {/* Nội dung comment */}
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-3 py-2 relative">
                    
                    {/* Header: Tên + Thời gian */}
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-semibold text-xs text-gray-800">
                        {comment.user?.name || comment.user?.full_name || "Người dùng"}
                      </span>
                      <span className="text-[10px] text-gray-500 ml-2">
                        {/* Nếu là comment mới tạo (chưa có time thực), hiện 'Vừa xong' */}
                        {comment.isOptimistic 
                          ? "Đang gửi..." 
                          : formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: vi })
                        }
                      </span>
                    </div>
                    
                    {/* Text nội dung */}
                    <p className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                        {comment.content}
                    </p>

                    {/* Nút xóa (chỉ hiện khi hover và là chủ sở hữu) */}
                    {isOwner && !comment.isOptimistic && (
                      <button 
                        onClick={() => handleDelete(comment._id)}
                        disabled={deleteMutation.isPending}
                        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm transition-opacity cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết bình luận..."
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            rows="2"
            disabled={createMutation.isPending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!content.trim() || createMutation.isPending}
            className="absolute right-2 bottom-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {createMutation.isPending ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </form>
        <p className="text-[9px] text-gray-400 mt-1 ml-1">Enter để gửi, Shift+Enter xuống dòng</p>
      </div>
    </div>
  );
}