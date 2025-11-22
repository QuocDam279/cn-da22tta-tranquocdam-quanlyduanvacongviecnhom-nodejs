// services/auth-service/src/routes/auth.routes.js
import express from 'express';
import { register, login, getUsersInfo, findUserByEmail } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/users/info', getUsersInfo);
router.post('/users/find', findUserByEmail); // ⬅ thêm API mới

export default router;
