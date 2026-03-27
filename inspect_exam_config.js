const mongoose = require('mongoose');
const Exam = require('./models/exam');

const MONGO_URI = "mongodb://examuser:exam123@ac-hbrgyje-shard-00-00.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-01.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-02.pn3lbz9.mongodb.net:27017/online_exam_new?ssl=true&replicaSet=atlas-7wu70x-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Kirithivasan";

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB");

        try {
            const exams = await Exam.find({ title: /Weekly Exam/i });
            if (exams.length === 0) {
                console.log("No exams found matching 'Weekly Exam'");
                process.exit(0);
            }

            exams.forEach(exam => {
                console.log(`\nExam: ${exam.title}`);
                console.log(`  ID: ${exam._id}`);
                console.log(`  showResults: ${exam.showResults}`);
                console.log(`  enableAntiCheating: ${exam.enableAntiCheating}`);
                console.log(`  totalMarks: ${exam.totalMarks}`);
                console.log(`  passMarks: ${exam.passMarks}`);
            });

        } catch (e) {
            console.error(e);
        } finally {
            console.log("\nDone.");
            process.exit(0);
        }
    })
    .catch(err => console.error(err));
