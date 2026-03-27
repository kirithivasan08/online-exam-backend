require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/student');

const MONGO_URI = "mongodb://examuser:exam123@ac-hbrgyje-shard-00-00.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-01.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-02.pn3lbz9.mongodb.net:27017/online_exam_new?ssl=true&replicaSet=atlas-7wu70x-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Kirithivasan";

async function listStudents() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const students = await Student.find({});

        console.log("\n--- REGISTERED STUDENTS ---");
        if (students.length === 0) {
            console.log("No students found.");
        } else {
            students.forEach(s => {
                console.log(`Name: ${s.name} | Roll: ${s.rollNumber} | Email: ${s.email}`);
            });
        }
        console.log("---------------------------\n");

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

listStudents();
