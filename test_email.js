require('dotenv').config();
const sendEmail = require('./utils/emailService');

const testRecipient = process.argv[2] || process.env.EMAIL_USER;

if (!testRecipient) {
    console.error("❌ Usage: node test_email.js <recipient-email>");
    console.error("   Or set EMAIL_USER in .env file.");
    process.exit(1);
}

console.log(`📧 Attempting to send test email to: ${testRecipient}`);
console.log(`🔑 Using SMTP User: ${process.env.EMAIL_USER}`);

(async () => {
    try {
        await sendEmail({
            to: testRecipient,
            subject: "Test Email from Online Exam System 🚀",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: green;">It Works! 🎉</h2>
                    <p>If you are reading this, your email configuration is correct.</p>
                    <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
                </div>
            `
        });
        console.log("✅ Test script completed. Check your inbox!");
    } catch (err) {
        console.error("❌ Test failed:", err.message);
    }
})();
