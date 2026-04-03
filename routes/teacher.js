const express = require("express");
const routes = express.Router();
const Teacher = require("../models/teacher");
const crypto = require("crypto");
const sendEmail = require("../utils/emailService");

// Teacher Register - DISABLED: Moved to Admin Panel
/* 
routes.post("/register", async (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
        let teacher = await Teacher.findOne({ $or: [{ email }, { phone }] });
        if (teacher) {
            return res.status(400).json({ message: "Teacher with this email or phone already exists" });
        }

        // Generate a random token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        teacher = new Teacher({
            name,
            email,
            password,
            phone,
            isVerified: false,
            verificationToken
        });
        await teacher.save();

        // Send Email Verification Link
        const verifyUrl = `${process.env.BASE_URL || 'https://examsphere.space'}/api/teacher/verify/${verificationToken}`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #4f46e5;">Welcome to the Teacher Portal!</h2>
                <p>Hi ${name},</p>
                <p>Please click the button below to verify your email address and activate your teacher account:</p>
                <a href="${verifyUrl}" style="display:inline-block; padding:10px 20px; color:white; background-color:#4f46e5; text-decoration:none; border-radius:5px; margin-top:10px;">Verify My Email</a>
                <p style="margin-top:20px; font-size: 12px; color: #6b7280;">If the button doesn't work, copy and paste this link: <br> ${verifyUrl}</p>
            </div>
        `;

        const emailResult = await sendEmail({
            to: email,
            subject: "Verify Your Teacher Account Email",
            html: emailHtml
        });

        if (!emailResult.success) {
            // Clean up: Delete the teacher so they aren't stuck in "already exists" state
            await Teacher.deleteOne({ _id: teacher._id });
            
            let userFriendlyError = emailResult.error;
            if (userFriendlyError.includes("onboarding@resend.dev")) {
                userFriendlyError = "Resend Sandbox Restriction: Emails can only be sent to your own email address. Please verify your domain on Resend.com to send to others!";
            }

            return res.status(500).json({ 
                error: "Verification email failed to send.",
                details: userFriendlyError,
                message: "We couldn't send the verification email. " + userFriendlyError
            });
        }

        res.json({ message: "Registration successful! Please check your email to verify your account before logging in." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
*/

// Verify Email
routes.get("/verify/:token", async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ verificationToken: req.params.token });

        if (!teacher) {
            return res.status(400).send("<h3>Invalid or expired verification link.</h3>");
        }

        teacher.isVerified = true;
        teacher.verificationToken = null; // Clear token after use
        await teacher.save();

        res.redirect("/teacher-login.html?verified=true");
    } catch (err) {
        res.status(500).send("<h3>Server error during verification.</h3>");
    }
});

// Teacher Login (Flexible: Email or Phone)
routes.post("/login", async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const teacher = await Teacher.findOne({ 
            $or: [
                { email: identifier },
                { phone: identifier }
            ]
        });
        if (!teacher) {
            return res.status(400).json({ message: "Teacher not found" });
        }
        if (teacher.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Block unverified logins
        if (!teacher.isVerified) {
            return res.status(403).json({ message: "Please verify your email before logging in. Check your inbox!" });
        }
        res.json({
            message: "Login successful",
            teacherId: teacher._id,
            name: teacher.name
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Teacher Profile
routes.get("/profile/:id", async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id).select("-password");
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE Teacher Profile
routes.put("/profile/:id", async (req, res) => {
    try {
        const { name, phone } = req.body;
        const teacher = await Teacher.findByIdAndUpdate(
            req.params.id,
            { name, phone },
            { new: true }
        ).select("-password");
        res.json({ message: "Profile updated successfully", teacher });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = routes;
