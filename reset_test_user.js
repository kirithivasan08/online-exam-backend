require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/student');
const Answer = require('./models/answer'); // Assuming this is correct from earlier debugging

// Get email from command line args
const targetEmail = process.argv[2];

if (!targetEmail) {
    console.error("❌ Please provide an email address to delete.");
    console.log("Usage: node reset_test_user.js your@email.com");
    process.exit(1);
}

const MONGO_URI = "mongodb://examuser:exam123@ac-hbrgyje-shard-00-00.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-01.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-02.pn3lbz9.mongodb.net:27017/online_exam_new?ssl=true&replicaSet=atlas-7wu70x-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Kirithivasan";

async function resetUser() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const student = await Student.findOne({ email: targetEmail });

        if (!student) {
            console.log(`⚠️  Student with email '${targetEmail}' not found.`);
        } else {
            // Delete Student
            await Student.deleteOne({ _id: student._id });
            console.log(`✅ Deleted Student: ${student.name} (${student.email})`);

            // Optional: Delete their attempts too
            const deleteAttempts = await Answer.deleteMany({ studentId: student._id });
            console.log(`exams history (Attempts) deleted: ${deleteAttempts.deletedCount}`);
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("👋 Disconnected");
    }
}

resetUser();
