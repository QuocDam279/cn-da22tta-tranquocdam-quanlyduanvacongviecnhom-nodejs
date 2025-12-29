import cron from 'node-cron';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import Notification from '../models/Notification.js';
import http from '../utils/httpClient.js';
import { dispatchEmail } from '../controllers/notification.controller.js';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Helper function: Tạo chuỗi mô tả deadline theo tiếng Việt tự nhiên
 * @param {number} daysRemaining
 * @returns {string}
 */
const getDeadlineText = (daysRemaining) => {
  if (daysRemaining === 0) return 'hết hạn hôm nay';
  if (daysRemaining === 1) return 'hết hạn vào ngày mai';
  return `hết hạn sau ${daysRemaining} ngày`;
};

/**
 * Cron job chạy hàng ngày lúc 8:00 sáng (giờ Việt Nam)
 * Nhiệm vụ:
 * - Quét tất cả Task có due_date <= 3 ngày và gửi thông báo nhắc nhở mỗi ngày
 * - Quét tất cả Project có end_date <= 7 ngày và gửi thông báo nhắc nhở mỗi ngày
 * - Tạo Notification trong database và gửi email cho người được assign
 */
cron.schedule('0 8 * * *', async () => {
  const currentTime = dayjs().tz('Asia/Ho_Chi_Minh');
  
  const tasksNeedingReminder = [];
  const projectsNeedingReminder = [];
  const userIdsToFetch = new Set();

  try {
    // Bước 1: Lấy danh sách tất cả Task từ Task Service
    try {
      const { data: allTasks } = await http.task.get('/internal/all');

      if (allTasks && allTasks.length > 0) {
        for (const task of allTasks) {
          // Bỏ qua task không có deadline, đã hoàn thành, hoặc chưa assign
          if (!task.due_date || task.status === 'Done' || !task.assigned_to) {
            continue;
          }

          // Tính số ngày còn lại đến deadline
          const daysRemaining = dayjs(task.due_date).diff(currentTime, 'day');

          // Nếu còn từ 0 đến 3 ngày (bao gồm hôm nay), thêm vào danh sách nhắc nhở
          if (daysRemaining >= 0 && daysRemaining <= 3) {
            tasksNeedingReminder.push(task);
            userIdsToFetch.add(task.assigned_to);
          }
        }
      }
    } catch (error) {
      // Ghi lỗi nhưng tiếp tục xử lý Project
    }

    // Bước 2: Lấy danh sách tất cả Project từ Project Service
    try {
      const { data: allProjects } = await http.project.get('/internal/all');

      if (allProjects && allProjects.length > 0) {
        for (const project of allProjects) {
          // Bỏ qua project không có end_date, đã hoàn thành, hoặc không có owner
          if (!project.end_date || project.status === 'Completed' || !project.owner_id) {
            continue;
          }

          // Tính số ngày còn lại đến deadline
          const daysRemaining = dayjs(project.end_date).diff(currentTime, 'day');

          // Nếu còn từ 0 đến 7 ngày (bao gồm hôm nay), thêm vào danh sách nhắc nhở
          if (daysRemaining >= 0 && daysRemaining <= 7) {
            projectsNeedingReminder.push(project);
            userIdsToFetch.add(project.owner_id);
          }
        }
      }
    } catch (error) {
      // Ghi lỗi nhưng tiếp tục xử lý
    }

    // Nếu không có task hoặc project nào cần nhắc, kết thúc
    if (tasksNeedingReminder.length === 0 && projectsNeedingReminder.length === 0) {
      return;
    }

    // Bước 3: Lấy thông tin email của tất cả user liên quan
    const userEmailMap = {};

    try {
      const { data: users } = await http.auth.post('/users/info', {
        ids: Array.from(userIdsToFetch)
      });

      // Map user_id với email để tra cứu nhanh
      users.forEach(user => {
        userEmailMap[user._id] = user.email;
      });
    } catch (error) {
      // Nếu lỗi lấy email, vẫn tạo notification nhưng không gửi email
    }

    // Bước 4: Tạo và gửi thông báo cho từng Task
    const taskNotificationPromises = tasksNeedingReminder.map(async (task) => {
      const userEmail = userEmailMap[task.assigned_to];
      const daysRemaining = dayjs(task.due_date).diff(currentTime, 'day');
      const formattedDueDate = dayjs(task.due_date).format('DD/MM/YYYY');
      const deadlineText = getDeadlineText(daysRemaining);
      
      const notificationMessage =
        `⏰ Công việc "${task.task_name}" ${deadlineText} (${formattedDueDate})`;

      // Tạo bản ghi Notification trong database
      await Notification.create({
        user_id: task.assigned_to,
        reference_id: task._id,
        reference_model: 'Task',
        type: 'DEADLINE',
        message: notificationMessage,
        is_read: false,
        sent_at: userEmail ? new Date() : null
      });

      // Nếu có email, gửi email thông báo
      if (userEmail) {
        const emailSubject = daysRemaining === 0 
          ? '⏰ Nhắc nhở công việc (đến hạn hôm nay)'
          : daysRemaining === 1
          ? '⏰ Nhắc nhở công việc (đến hạn ngày mai)'
          : `⏰ Nhắc nhở công việc (còn ${daysRemaining} ngày)`;
        
        await dispatchEmail(userEmail, emailSubject, notificationMessage);
      }
    });

    // Bước 5: Tạo và gửi thông báo cho từng Project
    const projectNotificationPromises = projectsNeedingReminder.map(async (project) => {
      const ownerEmail = userEmailMap[project.owner_id];
      const daysRemaining = dayjs(project.end_date).diff(currentTime, 'day');
      const formattedEndDate = dayjs(project.end_date).format('DD/MM/YYYY');
      const deadlineText = getDeadlineText(daysRemaining);
      
      const notificationMessage =
        `🚨 Dự án "${project.name}" ${deadlineText} (${formattedEndDate})`;

      // Tạo bản ghi Notification trong database
      await Notification.create({
        user_id: project.owner_id,
        reference_id: project._id,
        reference_model: 'Project',
        type: 'DEADLINE',
        message: notificationMessage,
        is_read: false,
        sent_at: ownerEmail ? new Date() : null
      });

      // Nếu có email, gửi email thông báo
      if (ownerEmail) {
        const emailSubject = daysRemaining === 0 
          ? '🚨 Nhắc nhở dự án (đến hạn hôm nay)'
          : daysRemaining === 1
          ? '🚨 Nhắc nhở dự án (đến hạn ngày mai)'
          : `🚨 Nhắc nhở dự án (còn ${daysRemaining} ngày)`;
        
        await dispatchEmail(ownerEmail, emailSubject, notificationMessage);
      }
    });

    // Chờ tất cả notification được xử lý (không throw error nếu có lỗi từng cái)
    await Promise.allSettled([
      ...taskNotificationPromises,
      ...projectNotificationPromises
    ]);

  } catch (error) {
    // Xử lý lỗi tổng thể của cron job
  }
}, {
  scheduled: true,
  timezone: 'Asia/Ho_Chi_Minh'
});