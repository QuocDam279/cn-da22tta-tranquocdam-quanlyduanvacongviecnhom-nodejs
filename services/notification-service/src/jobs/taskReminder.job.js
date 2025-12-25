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
 * 🕒 Job chạy mỗi ngày lúc 8:00 sáng (giờ Việt Nam)
 */
cron.schedule('0 8 * * *', async () => {
  console.log('🕗 [CRON] Bắt đầu kiểm tra task sắp đến hạn...');

  try {
    // 1. Lấy tất cả task (Nếu API task hỗ trợ filter date thì tốt hơn, nhưng giả sử lấy all)
    // Lưu ý: Cron chạy internal, không có header User Authorization. 
    // Giả sử http client đã config secret key nội bộ hoặc service tin cậy lẫn nhau.
    const { data: tasks } = await http.task.get('/internal/all');

    if (!tasks || tasks.length === 0) {
      console.log('✅ Không có task nào cần xử lý.');
      return;
    }

    const now = dayjs().tz('Asia/Ho_Chi_Minh');
    const reminders = [];
    const userIdsToFetch = new Set();

    // 2. Filter in-memory các task sắp hết hạn (2 ngày)
    for (const task of tasks) {
      if (!task.due_date || task.status === 'Done' || !task.assigned_to) continue;

      const due = dayjs(task.due_date);
      const diff = due.diff(now, 'day');

      if (diff === 2) {
        reminders.push(task);
        userIdsToFetch.add(task.assigned_to);
      }
    }

    if (reminders.length === 0) {
      console.log('✅ Không có task nào sắp hết hạn (2 ngày).');
      return;
    }

    // 3. BULK FETCH User Emails (Gọi Auth Service 1 lần duy nhất)
    console.log(`📦 Bulk fetching info cho ${userIdsToFetch.size} users...`);
    let users = [];
    try {
      const authRes = await http.auth.post('/users/info', { 
        ids: Array.from(userIdsToFetch) 
      });
      users = authRes.data;
    } catch (e) {
      console.error('⚠️ Lỗi gọi Auth Service trong Cron:', e.message);
      // Vẫn tiếp tục để tạo Notification DB dù không gửi được mail
    }

    // Map User ID -> Email để lookup nhanh
    const userMap = {};
    if (users) {
      users.forEach(u => { userMap[u._id] = u.email; });
    }

    // 4. Xử lý song song: Tạo DB Record + Gửi Mail
    const jobPromises = reminders.map(async (task) => {
      const message = `⏰ Công việc "${task.task_name}" sắp đến hạn (${dayjs(task.due_date).format('DD/MM/YYYY')})`;
      const userEmail = userMap[task.assigned_to];

      // Tạo Notification trong DB
      const noti = await Notification.create({
        user_id: task.assigned_to,
        task_id: task._id,
        message,
        is_read: false,
        sent_at: userEmail ? new Date() : null // Đánh dấu sent nếu có email
      });

      // Gửi mail (nếu có email)
      if (userEmail) {
        await dispatchEmail(userEmail, '⏰ Nhắc nhở công việc', message);
      }
      
      return noti;
    });

    await Promise.allSettled(jobPromises);

    console.log(`✅ Hoàn tất. Đã xử lý ${reminders.length} task nhắc nhở.`);

  } catch (error) {
    console.error('❌ CRON JOB FAILED:', error.message);
  }
}, {
  scheduled: true,
  timezone: 'Asia/Ho_Chi_Minh'
});