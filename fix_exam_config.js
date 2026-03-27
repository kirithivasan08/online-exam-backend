const mongoose = require('mongoose');
const Exam = require('./models/exam');

mongoose.connect('mongodb://localhost:27017/online-exam')
    .then(async () => {
        console.log("Connected to MongoDB");

        try {
            // Find all exams with CA-2 in title and set showResults to true
            const result = await Exam.updateMany(
                { title: /CA-2/i },
                { $set: { showResults: true } }
            );

            console.log(`Updated ${result.modifiedCount} exams to show results.`);

            // Verify
            const exams = await Exam.find({ title: /CA-2/i });
            exams.forEach(e => console.log(`${e.title}: showResults=${e.showResults}`));

        } catch (e) {
            console.error(e);
        } finally {
            console.log("Done.");
            process.exit(0);
        }
    })
    .catch(err => console.error(err));
