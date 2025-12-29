/**
 * 🔒 Middleware bảo vệ Internal API
 * Chỉ cho phép các service nội bộ gọi endpoint này
 */
export const internalApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    console.warn('⚠️ Unauthorized internal API call attempt');
    return res.status(403).json({ message: 'Forbidden: Invalid or missing API Key' });
  }
  
  next();
};