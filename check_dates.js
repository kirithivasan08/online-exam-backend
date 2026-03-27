const mongoose = require("mongoose");
const Answer = require("./models/answer");

const uri = "mongodb://examuser:exam123@ac-hbrgyje-shard-00-00.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-01.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-02.pn3lbz9.mongodb.net:27017/online_exam_new?ssl=true&replicaSet=atlas-7wu70x-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Kirithivasan";

mongoose.connect(uri)
    .then(async () => {
        console.log("Connected. Checking Answer dates...");
        const answers = await Answer.find({});
        console.log(`Found ${answers.length} total answers.`);

        answers.forEach(a => {
            console.log(`ID: ${a._id}, CreatedAt: ${a.createdAt} (${typeof a.createdAt})`);
        });
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
