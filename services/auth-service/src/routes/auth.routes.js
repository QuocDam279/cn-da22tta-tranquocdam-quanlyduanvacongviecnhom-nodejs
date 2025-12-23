// services/auth-service/src/routes/auth.routes.js
import express from 'express';
import passport from '../config/passport.js';
import { 
  register, 
  login, 
  getUsersInfo, 
  findUserByEmail,
  googleCallback 
} from '../controllers/auth.controller.js';

const router = express.Router();

// Local authentication
router.post('/register', register);
router.post('/login', login);

// Google OAuth
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed` 
  }),
  googleCallback
);

// Internal APIs
router.post('/users/info', getUsersInfo);
router.post('/users/find', findUserByEmail);

export default router;