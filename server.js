require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// ROUTE FILES
const teacherRoutes = require("./routes/teacher");
const studentRoutes = require("./routes/student");
const examRoutes = require("./routes/exam");
const attemptRoutes = require("./routes/attempt");
const adminRoutes = require("./routes/admin");

const app = express();

// ======================
// MIDDLEWARES
// ======================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve frontend files from /public
app.use(express.static(path.join(__dirname, "public")));

// ======================
// MONGODB CONNECTION
// ======================
mongoose
    .connect(
        "mongodb://examuser:exam123@ac-hbrgyje-shard-00-00.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-01.pn3lbz9.mongodb.net:27017,ac-hbrgyje-shard-00-02.pn3lbz9.mongodb.net:27017/online_exam_new?ssl=true&replicaSet=atlas-7wu70x-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Kirithivasan",
        {
            serverSelectionTimeoutMS: 5000
        }
    )
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    .catch((error) => {
        console.error("MongoDB Connection Error:", error.message);
    });

// ======================
// TEST ROUTE
// ======================
app.get("/", (req, res) => {
    res.send("Online Examination Backend Started");
});

// ======================
// API ROUTES
// ======================
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/attempt", attemptRoutes);
app.use("/api/admin", adminRoutes);

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
