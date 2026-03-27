const mongoose = require('mongoose');

const mongoURI = "mongodb://examuser:exam123@ac-hbrgyje-shard-00-00.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-01.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-02.pn3lbz9.mongodb.net:27017/online_exam_new?ssl=true&replicaSet=atlas-7wu70x-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Kirithivasan";

mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
        console.log("Connected to MongoDB for migration");
        const Student = require('./models/student');

        const result = await Student.updateMany(
            { $or: [{ department: { $exists: false } }, { department: null }] },
            { $set: { department: "Computer Science", year: "1st Year" } }
        );

        console.log(`Migration complete. Modified ${result.modifiedCount} accounts.`);
        process.exit(0);
    })
    .catch(err => {
        console.error("Migration failed:", err);
        process.exit(1);
    });
