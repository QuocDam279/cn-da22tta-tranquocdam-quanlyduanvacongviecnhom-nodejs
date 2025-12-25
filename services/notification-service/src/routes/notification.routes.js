import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  createNotification,
  getMyNotifications,
  getNotificationById,      // ⭐ Import thêm
  markAsRead,
  markAllAsRead,             // ⭐ Import thêm
  deleteNotification,
  getUnreadCount,            // ⭐ Import thêm
  sendNotificationMailAPI
} from '../controllers/notification.controller.js';

const router = express.Router();

router.post('/', verifyToken, createNotification);
router.get('/my', verifyToken, getMyNotifications);
router.get('/unread/count', verifyToken, getUnreadCount);        // ⭐ Thêm
router.put('/read-all', verifyToken, markAllAsRead);             // ⭐ Thêm
router.post('/send', verifyToken, sendNotificationMailAPI);
router.get('/:id', verifyToken, getNotificationById);            // ⭐ Thêm
router.put('/:id/read', verifyToken, markAsRead);
router.delete('/:id', verifyToken, deleteNotification);

export default router;