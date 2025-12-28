import dotenv from 'dotenv';
dotenv.config();

export default {
  service: process.env.MAIL_SERVICE || 'gmail',
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  from: process.env.MAIL_FROM || process.env.MAIL_USER
};
