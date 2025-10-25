// services/auth-service/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    full_name: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avartar: { type: String },
    created_at: { type: Date, default: Date.now},
    last_login: { type: Date }
});

// Mã hóa mật khẩu trước khi lưu người dùng
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Phương thức để so sánh mật khẩu
userSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);