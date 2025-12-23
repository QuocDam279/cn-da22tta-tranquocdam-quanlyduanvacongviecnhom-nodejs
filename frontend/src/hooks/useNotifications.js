import { useMemo } from "react";
import { useMyTasks } from "./useTasks";
import { useMyProjects } from "./useProjects"; // Giả định bạn đã có hook này
import { differenceInCalendarDays, parseISO, isAfter, isBefore, addDays } from "date-fns";

export const useNotifications = () => {
  // 1. Lấy dữ liệu Task và Project của user
  const { data: tasks = [], isLoading: loadingTasks } = useMyTasks();
  const { data: projects = [], isLoading: loadingProjects } = useMyProjects();

  // 2. Xử lý Logic lọc
  const notifications = useMemo(() => {
    const notis = [];
    const today = new Date();

    // --- XỬ LÝ TASK (3 ngày) ---
    tasks.forEach((task) => {
      if (!task.due_date || task.status === "Done") return; // Bỏ qua task đã xong hoặc không có hạn

      const dueDate = new Date(task.due_date);
      const diffDays = differenceInCalendarDays(dueDate, today);

      // Logic: Quá hạn HOẶC (Sắp đến hạn <= 3 ngày và chưa qua ngày hôm nay quá xa)
      // Ở đây ta lấy: Quá hạn (số âm) hoặc Sắp đến hạn (0, 1, 2, 3)
      if (diffDays <= 3) {
        notis.push({
          id: task._id,
          type: "task",
          title: task.task_name,
          date: dueDate,
          diffDays: diffDays, // Để hiển thị "Hôm nay", "Ngày mai", "Quá hạn"
          link: `/congviec/${task._id}`,
          priority: task.priority,
        });
      }
    });

    // --- XỬ LÝ PROJECT (7 ngày) ---
    projects.forEach((project) => {
      if (!project.end_date || project.status === "Completed") return;

      const endDate = new Date(project.end_date);
      const diffDays = differenceInCalendarDays(endDate, today);

      if (diffDays <= 7) {
        notis.push({
          id: project._id,
          type: "project",
          title: project.project_name,
          date: endDate,
          diffDays: diffDays,
          link: `/duan/${project._id}`,
          priority: "High", // Project sắp hết hạn luôn quan trọng
        });
      }
    });

    // 3. Sắp xếp: Cái nào gấp hơn (diffDays nhỏ hơn) lên đầu
    return notis.sort((a, b) => a.diffDays - b.diffDays);
  }, [tasks, projects]);

  return {
    notifications,
    count: notifications.length,
    isLoading: loadingTasks || loadingProjects,
  };
};