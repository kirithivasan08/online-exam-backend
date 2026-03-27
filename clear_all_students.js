require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/student');
const Answer = require('./models/answer');
const Attempt = require('./models/answer'); // Same as Answer

const MONGO_URI = "mongodb://examuser:exam123@ac-hbrgyje-shard-00-00.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-01.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-02.pn3lbz9.mongodb.net:27017/online_exam_new?ssl=true&replicaSet=atlas-7wu70x-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Kirithivasan";

async function clearDatabase() {
    console.log("⚠️  WARNING: THIS WILL DELETE ALL STUDENTS AND ATTEMPTS!");

    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Delete Students
        const deleteStudents = await Student.deleteMany({});
        console.log(`✅ Deleted ALL Students: ${deleteStudents.deletedCount} records removed.`);

        // Delete Attempts (Since they reference students)
        const deleteAttempts = await Attempt.deleteMany({});
        console.log(`✅ Deleted ALL Exam Attempts: ${deleteAttempts.deletedCount} records removed.`);

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("👋 Disconnected");
    }
}

clearDatabase();
