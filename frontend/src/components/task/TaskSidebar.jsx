import React, { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import TaskProgressBar from "./TaskProgressBar";
import TaskDates from "./TaskDates";
import TaskPeople from "./TaskPeople";
import StatusSelect from "./StatusSelect";
import PrioritySelect from "./PrioritySelect";
import {
  useUpdateTaskStatus,
  useUpdateTaskProgress,
  useUpdateTaskPriority,
  useUpdateTaskDueDate,
  useUpdateTaskAssignee,
  useUpdateTaskStartDate,
} from "../../hooks/useTasks";

// Hàm so sánh ID an toàn
const areIdsEqual = (id1, id2) => {
  if (!id1 || !id2) return false;
  const str1 = typeof id1 === "object" ? id1.toString() : id1;
  const str2 = typeof id2 === "object" ? id2.toString() : id2;
  return str1 === str2;
};

// Định nghĩa mapping trạng thái
const STATUS_MAP = {
  VN: {
    "To Do": "Chưa thực hiện",
    "In Progress": "Đang thực hiện",
    "Done": "Đã hoàn thành"
  },
  EN: {
    "Chưa thực hiện": "To Do",
    "Đang thực hiện": "In Progress",
    "Đã hoàn thành": "Done"
  }
};

export default function TaskSidebar({
  task,
  onUpdated,
  currentUser,
  members = [],
  project,
}) {
  // 🔥 STATE LẠC QUAN: Dùng state này để hiển thị UI ngay lập tức
  const [localTask, setLocalTask] = useState(task);

  // Sync state nội bộ khi task từ parent thay đổi (VD: khi người khác update hoặc đổi task khác)
  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  const updateStatusMutation = useUpdateTaskStatus();
  const updateProgressMutation = useUpdateTaskProgress();
  const updatePriorityMutation = useUpdateTaskPriority();
  const updateDueDateMutation = useUpdateTaskDueDate();
  const updateStartDateMutation = useUpdateTaskStartDate();
  const updateAssigneeMutation = useUpdateTaskAssignee();

  // --- Permission Check ---
  const currentMemberInfo = members.find(m => 
    areIdsEqual(m.user?._id || m.user, currentUser?._id)
  );
  const isTeamLeader = currentMemberInfo?.role?.toLowerCase() === "leader";
  const isProjectCreator = areIdsEqual(project?.created_by?._id || project?.created_by, currentUser?._id);
  const canChangeAssignee = isTeamLeader || isProjectCreator;
  const canEditGeneral =
    canChangeAssignee || 
    areIdsEqual(task.assigned_to?._id || task.assigned_to, currentUser?._id) ||
    areIdsEqual(task.created_by?._id || task.created_by, currentUser?._id);

  const isUpdating =
    updateStatusMutation.isPending ||
    updateProgressMutation.isPending ||
    updatePriorityMutation.isPending ||
    updateDueDateMutation.isPending ||
    updateStartDateMutation.isPending ||
    updateAssigneeMutation.isPending;

  // Generic Handler
  const handleUpdate = async (mutation, payload, successMsg) => {
    try {
      const res = await mutation.mutateAsync(payload);
      if (res && (res.task || res)) {
        onUpdated(res.task || res);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Cập nhật thất bại");
      // Nếu lỗi, revert UI về trạng thái gốc từ props
      setLocalTask(task);
    }
  };

  // ✅ 1. Cập nhật Status -> Cập nhật Local Task NGAY LẬP TỨC
  const updateStatus = (valVN) => {
      const newStatus = STATUS_MAP.EN[valVN];
      let newProgress = localTask.progress;

      console.log("👉 [Sidebar] 1. User selected Status:", newStatus);
      console.log("👉 [Sidebar] 2. Current Progress:", newProgress);

      if (newStatus === "Done") {
        newProgress = 100;
        console.log("👉 [Sidebar] 3. Auto-set Progress to 100");
      } else if (newStatus === "To Do") {
        newProgress = 0;
        console.log("👉 [Sidebar] 3. Auto-set Progress to 0");
      }

      // Kiểm tra xem state có thực sự thay đổi không
      setLocalTask(prev => {
        console.log("👉 [Sidebar] 4. Updating Local State to:", { ...prev, status: newStatus, progress: newProgress });
        return { ...prev, status: newStatus, progress: newProgress };
      });

      handleUpdate(
        updateStatusMutation, 
        { taskId: task._id, status: newStatus, progress: newProgress }, 
        "Đã cập nhật trạng thái"
      );
    };

  // ✅ 2. Cập nhật Progress -> Cập nhật Local Task NGAY LẬP TỨC
  const updateProgress = (val) => {
    const num = Number(val);
    let newStatus = localTask.status;

    // Logic đồng bộ
    if (num === 100) newStatus = "Done";
    else if (num === 0) newStatus = "To Do";
    else newStatus = "In Progress";

    // 🔥 OPTIMISTIC UPDATE
    setLocalTask(prev => ({ ...prev, progress: num, status: newStatus }));

    // Gọi API
    handleUpdate(
      updateProgressMutation, 
      { taskId: task._id, progress: num, status: newStatus }, 
      "Đã cập nhật tiến độ"
    );
  };

  // Các hàm khác giữ nguyên, có thể áp dụng setLocalTask tương tự nếu muốn mượt
  const updatePriority = (val) => {
    const priorityMap = { Thấp: "Low", "Trung bình": "Medium", Cao: "High" };
    const newPriority = priorityMap[val];
    
    setLocalTask(prev => ({ ...prev, priority: newPriority })); // UI Update
    
    handleUpdate(updatePriorityMutation, { taskId: task._id, priority: newPriority }, "Đã cập nhật ưu tiên");
  };

  const updateDates = (field, val) => {
    if (field === "due_date") {
      setLocalTask(prev => ({ ...prev, due_date: val }));
      handleUpdate(updateDueDateMutation, { taskId: task._id, dueDate: val }, "Đã cập nhật hạn chót");
    } else if (field === "start_date") {
      setLocalTask(prev => ({ ...prev, start_date: val }));
      handleUpdate(updateStartDateMutation, { taskId: task._id, startDate: val }, "Đã cập nhật ngày bắt đầu");
    }
  };

  const updateAssignee = (newUserId) => {
    if (!newUserId || newUserId === task.assigned_to?._id) return;
    // Với Assignee thì hơi phức tạp để update local ngay vì cần object user đầy đủ
    // Nên ta để server trả về rồi update cũng được
    handleUpdate(updateAssigneeMutation, { taskId: task._id, userId: newUserId }, "Đã chuyển giao công việc");
  };

  const priorityMapReverse = { "Low": "Thấp", "Medium": "Trung bình", "High": "Cao" };

  return (
    <div className="bg-white h-full relative">
      
      {isUpdating && (
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 overflow-hidden z-10">
          <div className="h-full bg-blue-600 animate-progress"></div>
        </div>
      )}

      <div className="p-4 space-y-4">
        
        {!canEditGeneral && (
          <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
            <Lock className="text-gray-400" size={12} />
            <span className="text-xs text-gray-500 font-medium">Chỉ xem</span>
          </div>
        )}

        {/* Status & Priority */}
        <div className="space-y-3">
          {/* 🔥 Dùng localTask.status thay vì task.status */}
          <StatusSelect
            value={STATUS_MAP.VN[localTask.status] || "Chưa thực hiện"}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={!canEditGeneral || isUpdating}
          />
          {/* 🔥 Dùng localTask.priority */}
          <PrioritySelect
            value={priorityMapReverse[localTask.priority] || "Trung bình"}
            onChange={(e) => updatePriority(e.target.value)}
            disabled={!canEditGeneral || isUpdating}
          />
        </div>

        {/* Progress Bar */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg p-3 border border-gray-200">
          {/* 🔥 Dùng localTask.progress -> Thanh này sẽ nhảy ngay lập tức */}
          <TaskProgressBar
            progress={localTask.progress}
            onChange={updateProgress}
            disabled={!canEditGeneral || isUpdating}
          />
        </div>

        {/* Date Picker */}
        <div className="pt-3 border-t border-gray-100">
          <TaskDates
            task={localTask} // Pass localTask vào đây luôn để Date update mượt
            onUpdateDate={updateDates}
            hasEditPermission={canEditGeneral}
            isUpdating={isUpdating}
            projectStartDate={project?.start_date}
            projectEndDate={project?.end_date}
          />
        </div>

        {/* Assignee */}
        <div className="pt-3 border-t border-gray-100">
          <TaskPeople
            task={task} // Assignee giữ nguyên task gốc để tránh lỗi object user
            members={members}
            onUpdateAssignee={updateAssignee}
            canChangeAssignee={canChangeAssignee} 
            isUpdating={isUpdating}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; margin-left: 0; }
          50% { width: 50%; margin-left: 25%; }
          100% { width: 100%; margin-left: 100%; }
        }
        .animate-progress {
          animation: progress 1s infinite linear;
        }
      `}</style>
    </div>
  );
}