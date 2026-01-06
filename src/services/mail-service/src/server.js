import app from './app.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`📨 Mail Service đang chạy trên port ${PORT}`);
});
