const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Exam = require("../models/exam");

// CREATE EXAM
router.post("/create", async (req, res) => {
    try {
        const exam = new Exam(req.body);
        await exam.save();
        res.json({ message: "Exam created successfully", exam });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL EXAMS (With optional Student Filtering)
router.get("/all", async (req, res) => {
    try {
        const studentId = req.query.studentId;
        const teacherId = req.query.teacherId;

        let query = {};

        if (teacherId) {
            // Teacher gets to see all exams, no assignment filtering needed
            query = {};
        } else if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
            const objectId = new mongoose.Types.ObjectId(studentId);
            // Only fetch exams if assignedTo is empty OR studentId is in the assignedTo array
            query = {
                $or: [
                    { assignedTo: { $exists: false } },
                    { assignedTo: { $size: 0 } },
                    { assignedTo: objectId }
                ]
            };
        } else if (studentId === "null" || studentId === "undefined" || !studentId) {
            // If they aren't logged in right, only show them fully public exams
            query = {
                $or: [
                    { assignedTo: { $exists: false } },
                    { assignedTo: { $size: 0 } }
                ]
            };
        }

        const exams = await Exam.find(query);
        res.json(exams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }
        res.json(exam);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await Exam.findByIdAndDelete(req.params.id);
        res.json({ message: "Exam deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const Attempt = require("../models/answer");
const sendEmail = require("../utils/emailService");

// UPDATE EXAM
router.put("/:id", async (req, res) => {
    try {
        const examId = req.params.id;
        const updates = req.body;

        const exam = await Exam.findByIdAndUpdate(examId, updates, { new: true });

        // Trigger Result Emails if Published
        if (updates.showResults === true) {
            console.log(`Exam ${exam.title} published. Sending emails...`);

            // Find all attempts for this exam
            const attempts = await Attempt.find({ examId }).populate("studentId");

            // Send emails asynchronously (don't block response)
            attempts.forEach(attempt => {
                const student = attempt.studentId;
                if (student && student.email) {
                    const subject = `Exam Results Published: ${exam.title}`;
                    const html = `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #4f46e5;">Exam Results Released</h2>
                            <p>Dear ${student.name},</p>
                            <p>The results for <strong>${exam.title}</strong> have been published.</p>
                            
                            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Score:</strong> ${attempt.marksObtained} / ${exam.totalMarks}</p>
                                <p style="margin: 5px 0;"><strong>Status:</strong> ${attempt.status === 'evaluated' ? 'Graded' : 'Pending Review'}</p>
                            </div>

                            <a href="http://localhost:5000/login.html" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Detailed Report</a>
                        </div>
                    `;
                    sendEmail({ to: student.email, subject, html });
                }
            });
        }

        res.json({ message: "Exam updated successfully", exam });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
