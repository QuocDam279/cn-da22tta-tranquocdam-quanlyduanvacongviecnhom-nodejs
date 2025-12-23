import React from "react";
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

export default function TaskSidebar({
  task,
  onUpdated,
  currentUser,
  members = [],
  project,
}) {
  const updateStatusMutation = useUpdateTaskStatus();
  const updateProgressMutation = useUpdateTaskProgress();
  const updatePriorityMutation = useUpdateTaskPriority();
  const updateDueDateMutation = useUpdateTaskDueDate();
  const updateStartDateMutation = useUpdateTaskStartDate();
  const updateAssigneeMutation = useUpdateTaskAssignee();

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

  const handleUpdate = async (mutation, payload, successMsg) => {
    try {
      const res = await mutation.mutateAsync(payload);
      onUpdated(res.task);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Cập nhật thất bại");
    }
  };

  const updateStatus = (val) => {
    const statusMap = { "Chưa thực hiện": "To Do", "Đang thực hiện": "In Progress", "Đã hoàn thành": "Done" };
    const newStatus = statusMap[val];
    let newProgress = task.progress;
    if (val === "Đã hoàn thành") newProgress = 100;
    else if (val === "Chưa thực hiện") newProgress = 0;
    handleUpdate(updateStatusMutation, { taskId: task._id, status: newStatus, progress: newProgress }, "Đã cập nhật trạng thái");
  };

  const updateProgress = (val) => {
    const num = Number(val);
    let newStatus = task.status;
    if (num === 100) newStatus = "Done";
    else if (num === 0) newStatus = "To Do";
    else newStatus = "In Progress";
    handleUpdate(updateProgressMutation, { taskId: task._id, progress: num, status: newStatus }, "Đã cập nhật tiến độ");
  };

  const updatePriority = (val) => {
    const priorityMap = { Thấp: "Low", "Trung bình": "Medium", Cao: "High" };
    handleUpdate(updatePriorityMutation, { taskId: task._id, priority: priorityMap[val] }, "Đã cập nhật ưu tiên");
  };

  const updateDates = (field, val) => {
    if (field === "due_date") {
      handleUpdate(updateDueDateMutation, { taskId: task._id, dueDate: val }, "Đã cập nhật hạn chót");
    } else if (field === "start_date") {
      handleUpdate(updateStartDateMutation, { taskId: task._id, startDate: val }, "Đã cập nhật ngày bắt đầu");
    }
  };

  const updateAssignee = (newUserId) => {
    if (!newUserId || newUserId === task.assigned_to?._id) return;
    handleUpdate(updateAssigneeMutation, { taskId: task._id, userId: newUserId }, "Đã chuyển giao công việc");
  };

  const statusMapReverse = { "To Do": "Chưa thực hiện", "In Progress": "Đang thực hiện", "Done": "Đã hoàn thành" };
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

        <div className="space-y-3">
          <StatusSelect
            value={statusMapReverse[task.status] || "Chưa thực hiện"}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={!canEditGeneral || isUpdating}
          />
          <PrioritySelect
            value={priorityMapReverse[task.priority] || "Trung bình"}
            onChange={(e) => updatePriority(e.target.value)}
            disabled={!canEditGeneral || isUpdating}
          />
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg p-3 border border-gray-200">
          <TaskProgressBar
            progress={task.progress}
            onChange={updateProgress}
            disabled={!canEditGeneral || isUpdating}
          />
        </div>

        <div className="pt-3 border-t border-gray-100">
          <TaskDates
            task={task}
            onUpdateDate={updateDates}
            hasEditPermission={canEditGeneral}
            isUpdating={isUpdating}
            projectStartDate={project?.start_date}
            projectEndDate={project?.end_date}
          />
        </div>

        <div className="pt-3 border-t border-gray-100">
          <TaskPeople
            task={task}
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