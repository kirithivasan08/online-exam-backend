const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: { type: Boolean, default: false }, // ✅ New Field: Is email verified?
    verificationToken: String // ✅ New Field: Secret code link
});

module.exports = mongoose.model("Teacher", teacherSchema);
