const mongoose = require('mongoose');
const Answer = require('./models/answer');
const Exam = require('./models/exam');
const Student = require('./models/student');

const MONGO_URI = "mongodb://examuser:exam123@ac-hbrgyje-shard-00-00.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-01.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-02.pn3lbz9.mongodb.net:27017/online_exam_new?ssl=true&replicaSet=atlas-7wu70x-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Kirithivasan";

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB");

        try {
            // Get 5 most recent attempts
            const attempts = await Answer.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('studentId')
                .populate('examId');

            console.log(`\nFound ${attempts.length} recent attempts:\n`);

            attempts.forEach((a, i) => {
                console.log(`--- Attempt ${i + 1} ---`);
                console.log(`ID: ${a._id}`);
                console.log(`Created: ${a.createdAt}`);
                console.log(`Student: ${a.studentId ? a.studentId.name : 'NULL'} (${a.studentId ? a.studentId._id : 'missing'})`);
                console.log(`Exam: ${a.examId ? a.examId.title : 'NULL'} (${a.examId ? a.examId._id : 'missing'})`);
                console.log(`Score: ${a.marksObtained}`);
                console.log(`Status: ${a.status}`);
                console.log(`Result Hidden: ${a.resultHidden}`); // Should be undefined in schema but handled in route?
                console.log(`Snapshots: ${a.snapshots ? a.snapshots.length : 0}`);
                console.log('------------------');
            });

        } catch (e) {
            console.error(e);
        } finally {
            console.log("\nDone.");
            process.exit(0);
        }
    })
    .catch(err => console.error(err));
