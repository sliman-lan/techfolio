// backend/server.js
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// CORS
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// المسارات الثابتة
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// مسارات API
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/follow", require("./routes/follow"));
app.use("/api/comments", require("./routes/comment"));
app.use("/api/notifications", require("./routes/notification"));

// صفحة الترحيب
app.get("/", (req, res) => {
    res.json({ message: "API is running", time: new Date().toISOString() });
});

// صفحة اختبار
app.get("/api/test", (req, res) => {
    res.json({ status: "success", message: "API working" });
});

// تشغيل الخادم
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ CORS enabled for all origins`);
});
