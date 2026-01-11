import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Lấy avatar Google (ưu tiên ảnh gốc)
        const avatarUrl =
          profile._json?.picture ||
          profile.photos?.[0]?.value ||
          '';

        // 2. Tìm user theo google_id
        let user = await User.findOne({ google_id: profile.id });

        if (user) {
          // User đã tồn tại và đăng nhập bằng Google
          if (user.auth_provider === 'google') {
            user.avatar = avatarUrl; // cập nhật avatar mới
          }
        } else {
          // 3. Kiểm tra email có trùng tài khoản local không
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ email });
          }

          if (user) {
            // Link tài khoản local với Google
            user.google_id = profile.id;
            if (!user.avatar) {
              user.avatar = avatarUrl;
            }
          } else {
            // 4. User mới hoàn toàn
            user = new User({
              google_id: profile.id,
              email: profile.emails?.[0]?.value,
              full_name: profile.displayName,
              avatar: avatarUrl,
              auth_provider: 'google',
              created_at: new Date()
            });
          }
        }

        // Cập nhật lần đăng nhập cuối
        user.last_login = new Date();
        await user.save();

        return done(null, user);
      } catch (error) {
        console.error('Passport Google Strategy Error:', error);
        return done(error, null);
      }
    }
  )
);

// Lưu user id vào session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Lấy user từ session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
