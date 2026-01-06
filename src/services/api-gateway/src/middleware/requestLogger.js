//services/api-gateway/src/middleware/requestLogger.js
export const requestLogger = (req, res, next) => {
  console.log(`→ ${req.method} ${req.originalUrl} - from: ${req.ip}`);
  next();
};
