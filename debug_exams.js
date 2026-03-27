const mongoose = require('mongoose');
const Exam = require('./models/exam');

mongoose.connect('mongodb://localhost:27017/online-exam').then(async () => {
    console.log("Connected");
    const exams = await Exam.find({});
    console.log(JSON.stringify(exams, null, 2));
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
