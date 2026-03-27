const mongoose = require("mongoose");
const Answer = require("./models/answer");

const uri = "mongodb://examuser:exam123@ac-hbrgyje-shard-00-00.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-01.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-02.pn3lbz9.mongodb.net:27017/online_exam_new?ssl=true&replicaSet=atlas-7wu70x-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Kirithivasan";

mongoose.connect(uri)
    .then(async () => {
        console.log("Connected. Forcing date update on ALL answers...");

        const answers = await Answer.find({});
        console.log(`Found ${answers.length} answers.`);

        let count = 0;
        for (const answer of answers) {
            // Force update regardless of current state
            await Answer.updateOne(
                { _id: answer._id },
                { $set: { createdAt: new Date() } },
                { timestamps: false, strict: false } // strict: false to ensure we can write fields
            );
            count++;
            if (count % 5 === 0) console.log(`Updated ${count}...`);
        }

        console.log(`Finished updating ${count} records.`);
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
