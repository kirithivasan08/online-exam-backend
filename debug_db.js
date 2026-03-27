const mongoose = require("mongoose");
const Answer = require("./models/answer");

mongoose.connect("mongodb://examuser:exam123@ac-hbrgyje-shard-00-00.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-01.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-02.pn3lbz9.mongodb.net:27017/online_exam_new?ssl=true&replicaSet=atlas-7wu70x-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Kirithivasan")
    .then(async () => {
        console.log("Connected. Fetching last 5 attempts...");
        const attempts = await Answer.find().sort({ _id: -1 }).limit(5);
        attempts.forEach(a => {
            console.log(`ID: ${a._id}, CreatedAt: ${a.createdAt}, Marks: ${a.marksObtained}`);
        });
        process.exit();
    })
    .catch(err => console.error(err));
