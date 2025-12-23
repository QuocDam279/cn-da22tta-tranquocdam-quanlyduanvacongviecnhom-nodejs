// services/auth-service/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    full_name: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Không bắt buộc cho Google login
    avatar: { type: String },
    google_id: { type: String, unique: true, sparse: true },
    auth_provider: { type: String, enum: ['local', 'google'], default: 'local' },
    created_at: { type: Date, default: Date.now},
    last_login: { type: Date }
});

// Chỉ hash password nếu tồn tại và bị thay đổi
userSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Phương thức để so sánh mật khẩu
userSchema.methods.comparePassword = function(password) {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);