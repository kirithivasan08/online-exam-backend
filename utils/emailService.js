const { Resend } = require('resend');

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 */
const sendEmail = async ({ to, subject, html, text }) => {
    // Check if API key is set
    if (!process.env.RESEND_API_KEY) {
        console.error("⚠️  Resend API Key missing in environment variables. Email NOT sent.");
        return { success: false, error: "Email configuration missing on server." };
    }

    console.log(`📧 Preparing to send email via Resend to: ${to}`);

    try {
        const { data, error } = await resend.emails.send({
            from: "onboarding@resend.dev", // Free-tier default sending email for Resend
            to,
            subject,
            html,
        });

        if (error) {
            console.error("❌ Error sending email via Resend:", JSON.stringify(error, null, 2));
            return { success: false, error: error.message || "Resend API error" };
        }

        console.log("✅ Email sent successfully via Resend. ID:", data.id);
        return { success: true, id: data.id };
    } catch (error) {
        console.error("❌ Exception when calling Resend API:", error);
        return { success: false, error: error.message || "Resend connection error" };
    }
};

module.exports = sendEmail;
