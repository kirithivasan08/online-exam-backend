const express = require("express");
const routes = express.Router();
const Teacher = require("../models/teacher");
const crypto = require("crypto");
const sendEmail = require("../utils/emailService");

// Teacher Register
routes.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let teacher = await Teacher.findOne({ email });
        if (teacher) {
            return res.status(400).json({ message: "Teacher already exists" });
        }

        // Generate a random token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        teacher = new Teacher({
            name,
            email,
            password,
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

        const emailSentInfo = await sendEmail({
            to: email,
            subject: "Verify Your Teacher Account Email",
            html: emailHtml
        });

        // Fallback: If email fails to send (Render SMTP block, timeout), auto-verify the teacher
        if (!emailSentInfo) {
            teacher.isVerified = true;
            await teacher.save();
            return res.json({ message: "Registration successful! (Email skipped due to server restrictions. Auto-verified)." });
        }

        res.json({ message: "Registration successful! Please check your email to verify your account before logging in." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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

// Teacher Login
routes.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const teacher = await Teacher.findOne({ email });
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

module.exports = routes;
