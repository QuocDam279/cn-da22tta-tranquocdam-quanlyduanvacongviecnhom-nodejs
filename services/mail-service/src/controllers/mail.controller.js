import transporter from '../utils/transporter.js';
import mailConfig from '../config/mailConfig.js';

// =====================================================================
// 🛠️ PRIVATE HELPERS
// =====================================================================

/**
 * 🧹 Validate dữ liệu gửi mail
 */
const validateMailInput = ({ to, subject, text, html }) => {
  const errors = [];
  if (!to) errors.push('Thiếu người nhận (to)');
  if (!subject) errors.push('Thiếu tiêu đề (subject)');
  if (!text && !html) errors.push('Nội dung (text/html) không được để trống');
  
  return errors;
};

// =====================================================================
// 🎮 CONTROLLERS
// =====================================================================

/**
 * 📧 Gửi mail (Synchronous Wait)
 * Service gọi (Auth/Notification) sẽ chờ đến khi SMTP Server nhận mail.
 * Thích hợp cho: OTP, Mail xác nhận quan trọng cần biết kết quả ngay.
 */
export const sendMail = async (req, res) => {
  const { to, subject, text, html, attachments } = req.body;

  // 1. Validate Input
  const errors = validateMailInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });
  }

  try {
    const mailOptions = {
      from: mailConfig.from || '"No Reply" <system@example.com>',
      to,
      subject,
      text,
      html,
      attachments // Hỗ trợ gửi file đính kèm nếu cần
    };

    // 2. Gửi mail
    const info = await transporter.sendMail(mailOptions);

    console.log(`📤 [MAIL SUCCESS] To: ${to} | ID: ${info.messageId}`);

    // 3. Trả về messageId để tracking
    res.json({ 
      success: true, 
      message: 'Đã gửi yêu cầu tới SMTP Server', 
      messageId: info.messageId 
    });

  } catch (error) {
    console.error(`❌ [MAIL FAILED] To: ${to} | Error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      message: 'Gửi mail thất bại', 
      error: error.message 
    });
  }
};

/**
 * 🚑 Health Check SMTP Connection
 * API này để Gateway hoặc Kubernetes kiểm tra xem kết nối SMTP có ổn định không
 */
export const checkConnection = async (req, res) => {
  try {
    await transporter.verify();
    res.json({ status: 'OK', message: 'SMTP Connection is healthy' });
  } catch (error) {
    console.error('❌ SMTP Connection Error:', error.message);
    res.status(503).json({ status: 'ERROR', message: 'SMTP Connection failed', error: error.message });
  }
};