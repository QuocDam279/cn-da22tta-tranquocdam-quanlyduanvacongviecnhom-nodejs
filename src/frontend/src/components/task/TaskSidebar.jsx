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

const areIdsEqual = (id1, id2) => {
  if (!id1 || !id2) return false;
  const str1 = typeof id1 === "object" ? id1.toString() : id1;
  const str2 = typeof id2 === "object" ? id2.toString() : id2;
  return str1 === str2;
};

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
  const [localTask, setLocalTask] = useState(task);

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
  
  // 🔥 SỬA: Kiểm tra assigned_to an toàn (có thể null)
  const isAssignedUser = localTask.assigned_to 
    ? areIdsEqual(localTask.assigned_to._id || localTask.assigned_to, currentUser?._id)
    : false;
  
  const canChangeAssignee = isTeamLeader || isProjectCreator;
  
  // 🔥 SỬA: Nếu task chưa giao (assigned_to = null), chỉ Leader mới sửa được
  const canEditStatusProgress = isTeamLeader || (localTask.assigned_to && isAssignedUser);
  
  const canEditPriorityDates = isTeamLeader;

  const isUpdating =
    updateStatusMutation.isPending ||
    updateProgressMutation.isPending ||
    updatePriorityMutation.isPending ||
    updateDueDateMutation.isPending ||
    updateStartDateMutation.isPending ||
    updateAssigneeMutation.isPending;

  const handleUpdate = async (mutation, payload, successMsg) => {
    try {
      const res = await mutation.mutateAsync(payload);
      if (res && (res.task || res)) {
        onUpdated(res.task || res);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Cập nhật thất bại");
      setLocalTask(task);
    }
  };

  const updateStatus = (valVN) => {
    const newStatus = STATUS_MAP.EN[valVN];
    const oldStatus = localTask.status;
    let newProgress = localTask.progress;

    if (newStatus === "Done") {
      newProgress = 100;
    } else if (newStatus === "To Do") {
      newProgress = 0;
    } else if (newStatus === "In Progress") {
      if (oldStatus === "Done") {
        newProgress = 99;
      } else if (oldStatus === "To Do") {
        newProgress = 1;
      }
    }

    setLocalTask(prev => ({ ...prev, status: newStatus, progress: newProgress }));
    handleUpdate(
      updateStatusMutation, 
      { taskId: task._id, status: newStatus, progress: newProgress }, 
      "Đã cập nhật trạng thái"
    );
  };

  const updateProgress = (val) => {
    const num = Number(val);
    let newStatus = localTask.status;

    if (num === 100) newStatus = "Done";
    else if (num === 0) newStatus = "To Do";
    else newStatus = "In Progress";

    setLocalTask(prev => ({ ...prev, progress: num, status: newStatus }));
    handleUpdate(
      updateProgressMutation, 
      { taskId: task._id, progress: num, status: newStatus }, 
      "Đã cập nhật tiến độ"
    );
  };

  const updatePriority = (val) => {
    const priorityMap = { Thấp: "Low", "Trung bình": "Medium", Cao: "High" };
    const newPriority = priorityMap[val];
    setLocalTask(prev => ({ ...prev, priority: newPriority }));
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
    // 🔥 THÊM: Xử lý unassign (chuyển về null)
    if (!newUserId) {
      setLocalTask(prev => ({ ...prev, assigned_to: null }));
      handleUpdate(
        updateAssigneeMutation, 
        { taskId: task._id, userId: null }, 
        "Đã gỡ giao công việc"
      );
      return;
    }
    
    // Kiểm tra không giao lại cho người đang được giao
    if (newUserId === task.assigned_to?._id) return;
    
    handleUpdate(
      updateAssigneeMutation, 
      { taskId: task._id, userId: newUserId }, 
      "Đã chuyển giao công việc"
    );
  };

  const priorityMapReverse = { "Low": "Thấp", "Medium": "Trung bình", "High": "Cao" };
  const hasAnyPermission = canEditStatusProgress || canEditPriorityDates || canChangeAssignee;

  return (
    <div className="bg-white h-full relative">
      
      {isUpdating && (
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 overflow-hidden z-10">
          <div className="h-full bg-blue-600 animate-progress"></div>
        </div>
      )}

      <div className="p-4 space-y-4">
        
        {!hasAnyPermission && (
          <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
            <Lock className="text-gray-400" size={12} />
            <span className="text-xs text-gray-500 font-medium">Chỉ xem</span>
          </div>
        )}

        <div className="space-y-3">
          <StatusSelect
            value={STATUS_MAP.VN[localTask.status] || "Chưa thực hiện"}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={!canEditStatusProgress || isUpdating}
          />
          <PrioritySelect
            value={priorityMapReverse[localTask.priority] || "Trung bình"}
            onChange={(e) => updatePriority(e.target.value)}
            disabled={!canEditPriorityDates || isUpdating}
          />
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg p-3 border border-gray-200">
          <TaskProgressBar
            progress={localTask.progress}
            onChange={updateProgress}
            disabled={!canEditStatusProgress || isUpdating}
          />
        </div>

        <div className="pt-3 border-t border-gray-100">
          <TaskDates
            task={localTask}
            onUpdateDate={updateDates}
            hasEditPermission={canEditPriorityDates}
            isUpdating={isUpdating}
            projectStartDate={project?.start_date}
            projectEndDate={project?.end_date}
          />
        </div>

        <div className="pt-3 border-t border-gray-100">
          <TaskPeople
            task={localTask} 
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