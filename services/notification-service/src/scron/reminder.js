import cron from 'node-cron';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import Notification from '../models/Notification.js';
import http from '../utils/httpClient.js';
import { dispatchEmail } from '../controllers/notification.controller.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// Chạy 8:00 sáng hàng ngày
cron.schedule('0 8 * * *', async () => {
  console.log('🕗 [CRON] Bắt đầu kiểm tra Task & Project sắp đến hạn...');
  const now = dayjs().tz('Asia/Ho_Chi_Minh');
  const userIdsToFetch = new Set();
  const taskReminders = [];
  const projectReminders = [];

  try {
    // ======================================================
    // 1. QUÉT TASK (Sắp hết hạn trong 2 ngày)
    // ======================================================
    try {
        const { data: tasks } = await http.task.get('/internal/all'); // Nên tối ưu API này sau
        if (tasks) {
            for (const task of tasks) {
                if (!task.due_date || task.status === 'Done' || !task.assigned_to) continue;
                const diff = dayjs(task.due_date).diff(now, 'day');
                
                if (diff === 2) { // Nhắc trước 2 ngày
                    taskReminders.push(task);
                    userIdsToFetch.add(task.assigned_to);
                }
            }
        }
    } catch (err) { console.error("⚠️ Lỗi fetch Tasks:", err.message); }

    // ======================================================
    // 2. QUÉT PROJECT (Sắp hết hạn trong 3 ngày) - MỚI THÊM
    // ======================================================
    try {
        const { data: projects } = await http.project.get('/internal/all');
        if (projects) {
            for (const proj of projects) {
                // Giả sử project có field 'owner_id' hoặc 'manager_id'
                if (!proj.end_date || proj.status === 'Completed' || !proj.owner_id) continue;
                const diff = dayjs(proj.end_date).diff(now, 'day');

                if (diff === 3) { // Nhắc trước 3 ngày
                    projectReminders.push(proj);
                    userIdsToFetch.add(proj.owner_id);
                }
            }
        }
    } catch (err) { console.error("⚠️ Lỗi fetch Projects:", err.message); }

    if (taskReminders.length === 0 && projectReminders.length === 0) {
        console.log('✅ Không có gì cần nhắc hôm nay.');
        return;
    }

    // ======================================================
    // 3. LẤY EMAIL USER (Gộp ID của cả Task và Project để gọi 1 lần)
    // ======================================================
    console.log(`📦 Lấy email cho ${userIdsToFetch.size} users...`);
    const userMap = {};
    if (userIdsToFetch.size > 0) {
        try {
            const { data: users } = await http.auth.post('/users/info', { ids: Array.from(userIdsToFetch) });
            users.forEach(u => { userMap[u._id] = u.email; });
        } catch (e) { console.error('⚠️ Lỗi Auth Service:', e.message); }
    }

    // ======================================================
    // 4. XỬ LÝ TASK REMINDERS
    // ======================================================
    const taskPromises = taskReminders.map(async (task) => {
        const email = userMap[task.assigned_to];
        const message = `⏰ Task "${task.task_name}" sắp đến hạn (${dayjs(task.due_date).format('DD/MM/YYYY')})`;

        await Notification.create({
            user_id: task.assigned_to,
            reference_id: task._id,
            reference_model: 'Task',
            type: 'DEADLINE',
            message,
            is_read: false,
            sent_at: email ? new Date() : null
        });

        if (email) await dispatchEmail(email, '⏰ Nhắc nhở công việc', message);
    });

    // ======================================================
    // 5. XỬ LÝ PROJECT REMINDERS
    // ======================================================
    const projectPromises = projectReminders.map(async (proj) => {
        const email = userMap[proj.owner_id];
        const message = `🚨 Dự án "${proj.name}" sắp đến hạn bàn giao (${dayjs(proj.end_date).format('DD/MM/YYYY')})`;

        await Notification.create({
            user_id: proj.owner_id,
            reference_id: proj._id,
            reference_model: 'Project',
            type: 'DEADLINE',
            message,
            is_read: false,
            sent_at: email ? new Date() : null
        });

        if (email) await dispatchEmail(email, '🚨 Nhắc nhở Dự án', message);
    });

    await Promise.allSettled([...taskPromises, ...projectPromises]);
    console.log(`✅ Hoàn tất cron job. (${taskReminders.length} tasks, ${projectReminders.length} projects)`);

  } catch (error) {
    console.error('❌ CRON JOB FAILED:', error.message);
  }
}, {
  scheduled: true,
  timezone: 'Asia/Ho_Chi_Minh'
});