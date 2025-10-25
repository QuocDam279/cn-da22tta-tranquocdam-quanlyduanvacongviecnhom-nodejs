import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.header.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch {
        res.status(401).json({ message: 'Token không hợp lệ' });
    }
};