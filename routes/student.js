const express = require("express");
const routes = express.Router();
const Student = require("../models/student");
const crypto = require("crypto");
const sendEmail = require("../utils/emailService");

// Student Register
routes.post("/register", async (req, res) => {
    const { name, rollNumber, email, password, department, year } = req.body;
    try {
        let student = await Student.findOne({ $or: [{ email }, { rollNumber }] });
        if (student) {
            return res.status(400).json({ message: "Student with this email or roll number already exists" });
        }

        // Generate a random token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        student = new Student({
            name,
            rollNumber,
            email,
            password,
            department,
            year,
            isVerified: false,
            verificationToken
        });
        await student.save();

        // Send Email Verification Link
        const verifyUrl = `${process.env.BASE_URL || 'https://examsphere.space'}/api/student/verify/${verificationToken}`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #4f46e5;">Welcome to Online Exam System!</h2>
                <p>Hi ${name},</p>
                <p>Please click the button below to verify your email address and activate your student account:</p>
                <a href="${verifyUrl}" style="display:inline-block; padding:10px 20px; color:white; background-color:#4f46e5; text-decoration:none; border-radius:5px; margin-top:10px;">Verify My Email</a>
                <p style="margin-top:20px; font-size: 12px; color: #6b7280;">If the button doesn't work, copy and paste this link: <br> ${verifyUrl}</p>
            </div>
        `;

        const emailSentInfo = await sendEmail({
            to: email,
            subject: "Verify Your Student Account Email",
            html: emailHtml
        });

        // Fallback: If email sending failed (e.g., Render blocked the connection), auto-verify so they aren't locked out.
        if (!emailSentInfo) {
            student.isVerified = true;
            await student.save();
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
        const student = await Student.findOne({ verificationToken: req.params.token });

        if (!student) {
            return res.status(400).send("<h3>Invalid or expired verification link.</h3>");
        }

        student.isVerified = true;
        student.verificationToken = null; // Clear token after use
        await student.save();

        res.redirect("/login.html?verified=true");
    } catch (err) {
        res.status(500).send("<h3>Server error during verification.</h3>");
    }
});

// Student Login
routes.post("/login", async (req, res) => {
    const { rollNumber, password } = req.body;
    try {
        const student = await Student.findOne({ rollNumber });
        if (!student) {
            return res.status(400).json({ message: "Student not found" });
        }
        if (student.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Block unverified logins
        if (!student.isVerified) {
            return res.status(403).json({ message: "Please verify your email before logging in. Check your inbox!" });
        }
        res.json({
            message: "Login successful",
            studentId: student._id,
            name: student.name,
            rollNumber: student.rollNumber
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch all students (for teacher assigning exams)
routes.get("/all", async (req, res) => {
    try {
        // Exclude passwords
        const students = await Student.find({}, "-password");
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// TEMPORARY MIGRATION ROUTE: Fix old NULL department students
routes.get("/migrate-old-students", async (req, res) => {
    try {
        const result = await Student.updateMany(
            { $or: [{ department: { $exists: false } }, { department: null }] },
            { $set: { department: "Computer Science", year: "1st Year" } }
        );
        res.json({ message: "Migration complete", result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = routes;
