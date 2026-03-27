const mongoose = require("mongoose");
const Answer = require("./models/answer");
const Exam = require("./models/exam");

const uri = "mongodb://examuser:exam123@ac-hbrgyje-shard-00-00.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-01.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-02.pn3lbz9.mongodb.net:27017/online_exam_new?ssl=true&replicaSet=atlas-7wu70x-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Kirithivasan";

mongoose.connect(uri)
    .then(async () => {
        console.log("Connected. Starting data fix...");

        // 1. Fix Exams with Total Marks = 0
        const exams = await Exam.find();
        for (const exam of exams) {
            if (!exam.totalMarks || exam.totalMarks === 0) {
                let total = 0;
                if (exam.questions && exam.questions.length > 0) {
                    total = exam.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
                }
                // Use updateOne to avoid validation errors
                await Exam.updateOne(
                    { _id: exam._id },
                    { $set: { totalMarks: total } }
                );
                console.log(`Updated Exam '${exam.title}' total marks to ${total}`);
            }
        }

        // 2. Fix Answers with missing createdAt
        const answers = await Answer.find({ createdAt: { $exists: false } });
        console.log(`Found ${answers.length} answers without createdAt.`);

        for (const answer of answers) {
            await Answer.updateOne(
                { _id: answer._id },
                { $set: { createdAt: new Date() } },
                { timestamps: false }
            );
        }
        console.log("Updated missing timestamps.");

        console.log("Done.");
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
