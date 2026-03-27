const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam"
    },
    answers: [
        {
            questionIndex: Number,
            selectedOption: String, // For MCQ
            answerText: String // For Descriptive
        }
    ],
    marksObtained: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'evaluated'],
        default: 'evaluated'
    },
    snapshots: [String]
}, { timestamps: true });

module.exports = mongoose.model("Answer", answerSchema);
