// backend/server.js
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const fs = require("fs");

dotenv.config();
connectDB();

const app = express();

// CORS
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// التأكد من وجود المجلدات
const uploadsDir = path.join(__dirname, "uploads");
const avatarsDir = path.join(__dirname, "uploads", "avatars");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("📁 تم إنشاء مجلد uploads");
}
if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });
    console.log("📁 تم إنشاء مجلد uploads/avatars");
}

// المسارات الثابتة - تأكد من المسار الصحيح
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
console.log("📁 Static files served from:", path.join(__dirname, "uploads"));

// مسارات API
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/projects", require("./routes/projects"));

// like routes
app.use("/api/projects", require("./routes/like"));
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

// endpoint تجريبي للصور
app.get("/test-upload", (req, res) => {
    const avatarsPath = path.join(__dirname, "uploads", "avatars");
    const files = fs.readdirSync(avatarsPath);
    res.json({
        message: "Uploads folder",
        avatarsPath,
        files,
        staticUrl: "/uploads/avatars/",
    });
});

// تشغيل الخادم
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ Uploads folder: ${path.join(__dirname, "uploads")}`);
    console.log(`✅ Test uploads: http://localhost:${PORT}/test-upload`);
});
