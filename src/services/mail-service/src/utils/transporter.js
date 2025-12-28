import nodemailer from 'nodemailer';
import mailConfig from '../config/mailConfig.js';

const transporter = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  secure: false,
  auth: mailConfig.auth
});

// Kiểm tra kết nối SMTP khi khởi động
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ SMTP connection failed:', error);
  } else {
    console.log('✅ SMTP server is ready to take messages');
  }
});

export default transporter;
