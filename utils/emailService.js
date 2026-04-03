const nodemailer = require('nodemailer');

// Create a transporter
// For Gmail: use 'service': 'gmail'
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports (like 587 STARTTLS)
    auth: {
        user: process.env.EMAIL_USER,
        pass: (process.env.EMAIL_PASS || '').replace(/\s+/g, '') // Remove spaces if copied directly
    },
    connectionTimeout: 5000, // 5 seconds to prevent hanging
    greetingTimeout: 5000,
    socketTimeout: 5000
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 */
const sendEmail = async ({ to, subject, html, text }) => {
    // Check if credentials are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("⚠️  Email configuration missing (EMAIL_USER/EMAIL_PASS). Email NOT sent.");
        return;
    }

    console.log(`📧 Preparing to send email to: ${to}`);

    try {
        const info = await transporter.sendMail({
            from: `"Online Exam System" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            text // ✅ Auto-generate from HTML if missing, or use provided
        });
        console.log("✅ Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Error sending email:", error);
        // Don't throw, just log. We don't want to break the app flow if email fails.
    }
};

module.exports = sendEmail;
