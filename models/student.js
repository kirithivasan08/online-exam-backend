const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: String,
    rollNumber: {
        type: String,
        unique: true
    },
    email: { type: String, unique: true },
    password: String,
    department: { type: String, required: true },
    year: { type: String, required: true },
    isVerified: { type: Boolean, default: false }, // ✅ New Field: Is email verified?
    verificationToken: String // ✅ New Field: Secret code link
});

module.exports = mongoose.model("Student", studentSchema);
