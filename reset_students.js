const mongoose = require("mongoose");
const Student = require("./models/student");
const Answer = require("./models/answer");

const MONGODB_URI = "mongodb://examuser:exam123@ac-hbrgyje-shard-00-00.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-01.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-02.pn3lbz9.mongodb.net:27017/online_exam_new?ssl=true&replicaSet=atlas-7wu70x-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Kirithivasan";

async function clearData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const studentRes = await Student.deleteMany({});
        console.log(`Deleted ${studentRes.deletedCount} students.`);

        const answerRes = await Answer.deleteMany({});
        console.log(`Deleted ${answerRes.deletedCount} exam attempts.`);

        console.log("Database successfully cleared of student data.");
        process.exit(0);
    } catch (err) {
        console.error("Error clearing data:", err);
        process.exit(1);
    }
}

clearData();
