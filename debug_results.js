const mongoose = require('mongoose');
const Answer = require('./models/answer');
const Exam = require('./models/exam');
const Student = require('./models/student');

mongoose.connect('mongodb://localhost:27017/online-exam')
    .then(async () => {
        console.log("Connected to MongoDB");

        try {
            const answers = await Answer.find().populate('examId');
            console.log(`Found ${answers.length} attempts.`);

            answers.forEach((a, i) => {
                console.log(`\nAttempt ${i + 1}:`);
                console.log(`  ID: ${a._id}`);
                console.log(`  ExamId (Raw): ${a.examId ? a.examId._id : 'NULL'}`);
                if (!a.examId) {
                    console.log(`  ⚠️ EXAM POPULATION FAILED! Reference is broken or null.`);
                    // Let's print the raw examId if we can access it (mongoose hides it if populated fails)
                    // We can't easily seeing the raw ID if populate returns null, unless we query without populate.
                } else {
                    console.log(`  Exam Title: ${a.examId.title}`);
                }
                console.log(`  Status: ${a.status}`);
                console.log(`  Marks: ${a.marksObtained}`);
            });

            // If we found broken references, let's find the raw ID
            const rawAnswers = await Answer.find();
            rawAnswers.forEach((a, i) => {
                if (!answers[i].examId) {
                    console.log(`\nRe-checking Attempt ${i + 1} (Raw):`);
                    console.log(`  Raw ExamId stored: ${a.examId}`);
                }
            });

        } catch (e) {
            console.error(e);
        } finally {
            console.log("Done.");
            process.exit(0);
        }
    })
    .catch(err => console.error(err));
