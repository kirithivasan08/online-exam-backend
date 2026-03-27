const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: String,
    questions: [{
        questionText: String,
        type: String,
        options: [String]
    }]
});
const Exam = mongoose.model('Exam', examSchema);

async function run() {
    try {
        await mongoose.connect('mongodb://localhost:27017/online-exam');
        console.log("Connected.");

        const exams = await Exam.find({ "questions.questionText": { $regex: "cns", $options: "i" } });

        if (exams.length === 0) {
            console.log("No exam found with that question.");
        } else {
            const q = exams[0].questions.find(q => q.questionText.toLowerCase().includes("cns"));
            console.log("QUESTION DATA:");
            console.log(JSON.stringify(q, null, 2));
        }
    } catch (e) {
        console.error(e);
    } finally {
        console.log("Exiting...");
        process.exit(0);
    }
}

run();
