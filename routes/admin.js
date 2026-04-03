const express = require("express");
const routes = express.Router();
const Teacher = require("../models/teacher");
const Student = require("../models/student");
const Exam = require("../models/exam");
const crypto = require("crypto");
const sendEmail = require("../utils/emailService");

// Admin Credentials
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin@123";

// Admin Login
routes.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        res.json({ success: true, message: "Welcome Admin!" });
    } else {
        res.status(401).json({ success: false, message: "Invalid Admin credentials" });
    }
});

// Admin Dashboard Stats
routes.get("/stats", async (req, res) => {
    try {
        const teachersCount = await Teacher.countDocuments();
        const studentsCount = await Student.countDocuments();
        const examsCount = await Exam.countDocuments();
        res.json({ teachersCount, studentsCount, examsCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manage Teachers: List All
routes.get("/teachers", async (req, res) => {
    try {
        const teachers = await Teacher.find({}, '-password');
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manage Teachers: Create New (Admin Only Registration)
routes.post("/teachers/create", async (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
        let teacher = await Teacher.findOne({ $or: [{ email }, { phone }] });
        if (teacher) {
            return res.status(400).json({ message: "Teacher with this email or phone already exists" });
        }

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

        const verifyUrl = `${process.env.BASE_URL || 'https://examsphere.space'}/api/teacher/verify/${verificationToken}`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #4f46e5;">Welcome to the Teacher Portal!</h2>
                <p>An administrator has created your teacher account. Please click below to verify your email and activate your account:</p>
                <a href="${verifyUrl}" style="display:inline-block; padding:10px 20px; color:white; background-color:#4f46e5; text-decoration:none; border-radius:5px; margin-top:10px;">Verify My Email</a>
            </div>
        `;

        await sendEmail({
            to: email,
            subject: "Verify Your New Teacher Account",
            html: emailHtml
        });

        res.json({ success: true, message: "Teacher created successfully! Verification email sent." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manage Teachers: Delete
routes.delete("/teachers/:id", async (req, res) => {
    try {
        await Teacher.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Teacher deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manage Students: List All
routes.get("/students", async (req, res) => {
    try {
        const students = await Student.find({}, '-password');
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manage Students: Delete
routes.delete("/students/:id", async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Student deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = routes;
