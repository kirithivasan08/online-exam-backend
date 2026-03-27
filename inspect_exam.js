const mongoose = require('mongoose');
const mongoose = require('mongoose');

// Define minimal schema inline to avoid model loading issues
const examSchema = new mongoose.Schema({
    title: String,
    questions: [{
        questionText: String,
        type: String,
        options: [String],
        correctAnswer: String
    }]
});
const Exam = mongoose.model('Exam', examSchema);

mongoose.connect('mongodb://localhost:27017/online-exam')
    .then(async () => {
        console.log("Connected to MongoDB");
        // We will fetch the most recent exam or search by title if known, 
        // but since I don't have the exact ID from the text easily (OCR is hard), 
        // I'll filter by the question text "what is full form of cns ?" seen in the screenshot.

        try {
            const exams = await Exam.find({ "questions.questionText": { $regex: "cns", $options: "i" } });
            console.log(`Found ${exams.length} exams matching query.`);

            exams.forEach(e => {
                console.log(`Exam ID: ${e._id}`);
                console.log(`Title: ${e.title}`);
                console.log("Questions:");
                e.questions.forEach((q, i) => {
                    console.log(`  Q${i + 1}: [${q.type}] ${q.questionText}`);
                    console.log(`       Options: ${q.options}`);
                });
            });

        } catch (e) {
            console.error(e);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error(err));
