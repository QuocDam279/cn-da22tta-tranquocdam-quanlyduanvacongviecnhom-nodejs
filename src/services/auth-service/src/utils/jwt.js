import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id, 
            email: user.email,
            name: user.full_name || user.email.split('@')[0] // ✅ THÊM DÒNG NÀY
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};