import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Cấu hình để dùng được __dirname trong ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // --- BẮT ĐẦU DEBUG LOG ---
      // Ghi log vào file 'debug_google_auth.txt' nằm cùng thư mục với file này
      try {
        const logPath = path.join(__dirname, 'debug_google_auth.txt');
        const logContent = `\n\n=== [${new Date().toISOString()}] GOOGLE LOGIN ===\n` +
                           `ID: ${profile.id}\n` +
                           `Name: ${profile.displayName}\n` +
                           `Raw Picture: ${profile._json?.picture}\n` +
                           `Photos Array: ${JSON.stringify(profile.photos)}\n` +
                           `--------------------------------------------------\n`;
        fs.appendFileSync(logPath, logContent);
        console.log(`[Passport] Đã ghi log profile vào: ${logPath}`);
      } catch (logError) {
        console.error("[Passport] Không thể ghi file log:", logError.message);
      }
      // --- KẾT THÚC DEBUG LOG ---

      // 1. Xác định Avatar chuẩn nhất (Ưu tiên ảnh gốc từ _json)
      const avatarUrl = profile._json?.picture || profile.photos?.[0]?.value || '';

      // 2. Tìm user trong DB
      let user = await User.findOne({ google_id: profile.id });

      if (user) {
        // --- TRƯỜNG HỢP 1: User cũ đăng nhập lại ---
        if (user.auth_provider === 'google') {
           // Luôn cập nhật avatar mới nhất từ Google để tránh link chết
           user.avatar = avatarUrl;
        }
      } 
      else {
        // --- TRƯỜNG HỢP 2: Check email xem có trùng với tài khoản Local không ---
        const email = profile.emails?.[0]?.value;
        if (email) {
            user = await User.findOne({ email: email });
        }

        if (user) {
          // Link tài khoản cũ với Google
          user.google_id = profile.id;
          
          // Nếu user chưa có avatar, lấy avatar Google đắp vào
          if (!user.avatar) {
             user.avatar = avatarUrl;
          }
        } else {
          // --- TRƯỜNG HỢP 3: User mới hoàn toàn ---
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

      // Cập nhật thời gian đăng nhập và lưu lại
      user.last_login = new Date();
      await user.save();

      return done(null, user);

    } catch (error) {
      console.error("Passport Strategy Error:", error);
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;