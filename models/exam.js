const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['mcq', 'descriptive'],
        default: 'mcq'
    },
    questionText: String,
    options: [String], // Only for MCQ
    correctAnswer: String, // Only for MCQ
    marks: Number
});

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    questions: [questionSchema],
    duration: {
        type: Number,   // in minutes
        required: true
    },
    passMarks: {
        type: Number,
        default: 0
    },
    totalMarks: {
        type: Number,
        default: 0
    },
    randomizeQuestions: {
        type: Boolean,
        default: false
    },
    enableAntiCheating: {
        type: Boolean,
        default: false
    },
    maxWarnings: {
        type: Number,
        default: 3
    },
    showResults: {
        type: Boolean,
        default: true
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }]
});

module.exports = mongoose.model("Exam", examSchema);
