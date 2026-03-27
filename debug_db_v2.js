const mongoose = require("mongoose");
const Answer = require("./models/answer");
const Exam = require("./models/exam");

const uri = "mongodb://examuser:exam123@ac-hbrgyje-shard-00-00.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-01.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-02.pn3lbz9.mongodb.net:27017/online_exam_new?ssl=true&replicaSet=atlas-7wu70x-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Kirithivasan";

mongoose.connect(uri)
    .then(async () => {
        console.log("Connected to DB.");

        // Check last 3 answers
        console.log("\n--- Last 3 Attempts ---");
        const attempts = await Answer.find().sort({ _id: -1 }).limit(3).populate("examId");

        if (attempts.length === 0) console.log("No attempts found.");

        attempts.forEach(a => {
            console.log(`\nID: ${a._id}`);
            console.log(`CreatedAt: ${a.createdAt} (Type: ${typeof a.createdAt})`);
            console.log(`Marks Obtained: ${a.marksObtained}`);
            if (a.examId) {
                console.log(`Exam Title: ${a.examId.title}`);
                console.log(`Exam Total Marks: ${a.examId.totalMarks}`);
            } else {
                console.log("ExamId not populated or null");
            }
        });

        console.log("\n--- Checking an Exam ---");
        const exam = await Exam.findOne();
        if (exam) {
            console.log(`Sample Exam: ${exam.title}, Total Marks: ${exam.totalMarks}`);
        }

        setTimeout(() => process.exit(), 1000);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
