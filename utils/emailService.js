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
        return undefined;
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
            console.error("❌ Error sending email via Resend:", error);
            return undefined; // Return undefined so fallback kicks in
        }

        console.log("✅ Email sent successfully via Resend: %s", data.id);
        return data;
    } catch (error) {
        console.error("❌ Exception when calling Resend API:", error);
        // Don't throw, return undefined so fallback kicks in
        return undefined;
    }
};

module.exports = sendEmail;
