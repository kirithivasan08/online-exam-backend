const express = require("express");
const router = express.Router();

const Exam = require("../models/exam");
const Answer = require("../models/answer");


// ==============================
// SUBMIT EXAM + AUTO EVALUATION
// ==============================
router.post("/submit", async (req, res) => {
    try {
        const { examId, studentId, answers } = req.body;

        // 1. Get exam
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        // 2. Calculate score & Determine Status
        let totalMarks = 0;
        let requiresManualEval = false;

        answers.forEach(ans => {
            const question = exam.questions[ans.questionIndex];

            // Check if descriptive or missing options/correctAnswer (fallback for legacy data)
            const isDescriptive = question && (question.type === 'descriptive' || (!question.options || question.options.length === 0) || !question.correctAnswer);

            if (isDescriptive) {
                requiresManualEval = true;
                // Descriptive answers get 0 marks initially
            } else if (
                question &&
                ans.selectedOption === question.correctAnswer
            ) {
                totalMarks += question.marks;
            }
        });

        const status = requiresManualEval ? 'pending' : 'evaluated';

        // 3. Save attempt
        const attempt = new Answer({
            examId,
            studentId,
            answers,
            marksObtained: totalMarks,
            status, // 'pending' or 'evaluated'
            snapshots: req.body.snapshots || [] // Save snapshots
        });

        await attempt.save();

        // Check if we should show the result
        const showResult = exam.showResults !== false; // Default true

        res.json({
            message: "Exam submitted successfully",
            marksObtained: (status === 'evaluated' && showResult) ? totalMarks : null,
            resultHidden: !showResult || status === 'pending',
            status,
            attemptId: attempt._id
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ==============================
// VIEW ALL ATTEMPTS (TESTING)
// ==============================
router.get("/all", async (req, res) => {
    const attempts = await Answer.find();
    res.json(attempts);
});


// ==============================
// TEACHER MANUAL EVALUATION
// ==============================
router.post("/evaluate", async (req, res) => {
    const { attemptId, marksObtained } = req.body;

    try {
        const attempt = await Answer.findById(attemptId);

        if (!attempt) {
            return res.status(404).json({ message: "Attempt not found" });
        }

        attempt.marksObtained = marksObtained;
        await attempt.save();

        res.json({
            message: "Marks updated successfully",
            attempt
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ==============================
// VIEW RESULTS (BROWSER)
// ==============================
router.get("/results", async (req, res) => {
    try {
        const results = await Answer.find()
            .populate("studentId", "name rollNumber")
            .populate("examId", "title subject");

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ==============================
// VIEW RESULT FOR LOGGED STUDENT
// ==============================
router.get("/result/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;

        // Populate showResults
        const results = await Answer.find({ studentId })
            .populate("examId", "title subject passMarks totalMarks questions showResults");

        // Filter data based on showResults
        const safeResults = results.map(attempt => {
            if (attempt.examId && attempt.examId.showResults === false) {
                return {
                    ...attempt.toObject(),
                    marksObtained: null, // Hide score
                    answers: [], // Hide answers
                    resultHidden: true
                };
            }
            return attempt;
        });

        res.json(safeResults);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==============================
// GET ATTEMPTS BY EXAM ID (TEACHER)
// ==============================
router.get("/exam/:examId", async (req, res) => {
    try {
        const { examId } = req.params;
        // Teacher should ALWAYS see results, so no filtering here.
        const attempts = await Answer.find({ examId })
            .populate("studentId", "name rollNumber")
            .populate("examId", "title subject totalMarks passMarks showResults");

        res.json(attempts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ==============================
// UPLOAD SNAPSHOT (PROCTORING)
// ==============================
router.post("/snapshot", async (req, res) => {
    try {
        const { attemptId, image } = req.body;

        // Find attempt and push to snapshots array
        // We use findByIdAndUpdate for efficiency, or findOne to append
        await Answer.findByIdAndUpdate(attemptId, {
            $push: { snapshots: image }
        });

        res.json({ message: "Snapshot saved" });
    } catch (error) {
        console.error("Snapshot error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==============================
// MANUAL EVALUATION ROUTE
// ==============================
router.put("/evaluate/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { marks, questionIndex } = req.body;
        // In a real app, we might update specific question marks in the array.
        // For simplicity now, let's assume the teacher sends the *Updated Total Marks*.
        // OR better: specific question grading. 
        // Let's go with: Teacher updates TOTAL MARKS directly for simplicity in this iteration.
        // "I read the answers, original auto-score was 10, I give +5 for theory, so new total is 15."

        // Wait, that's error prone. 
        // Let's simple: Update totalMarks and set status to evaluated.
        const { totalMarks } = req.body;

        const attempt = await Answer.findByIdAndUpdate(id, {
            marksObtained: totalMarks,
            status: 'evaluated'
        }, { new: true });

        res.json({ message: "Marks updated", attempt });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==============================
// DELETE ALL ATTEMPTS FOR A STUDENT
// ==============================
router.delete("/student/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;
        await Answer.deleteMany({ studentId });
        res.json({ message: "All history cleared successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==============================
// DELETE ALL ATTEMPTS FOR AN EXAM (TEACHER)
// ==============================
router.delete("/exam/:examId/all", async (req, res) => {
    try {
        const { examId } = req.params;
        await Answer.deleteMany({ examId });
        res.json({ message: "All exam results deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==============================
// DELETE ATTEMPT (TEACHER)
// ==============================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await Answer.findByIdAndDelete(id);
        res.json({ message: "Result deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ ALWAYS EXPORT AT END
module.exports = router;
