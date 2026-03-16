const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const fs = require("fs");

// تحميل متغيرات البيئة
dotenv.config();

// الاتصال بقاعدة البيانات
connectDB();

// إنشاء تطبيق Express
const app = express();

// إعدادات CORS المتقدمة
const allowedOrigins = [
  'http://localhost:3000',           // للتطوير المحلي
  'https://techfolio-project-e7im2namj-slimans-projects-6f0f14b8.vercel.app/', // ضع رابط الفرونت إند الفعلي من Vercel هنا
];

app.use(cors({
  origin: function (origin, callback) {
    // السماح للطلبات التي لا تحمل origin (مثل Postman أو تطبيقات الخادم)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('غير مسموح بالوصول عبر CORS'));
    }
  },
  credentials: true, // ⬅️ ضروري للسماح بإرسال التوكن والكوكيز
}));

// إذا أردت تجربة سريعة (السماح لأي origin مع credentials) استبدل ما سبق بهذا:
// app.use(cors({
//   origin: true,  // يعكس origin الطالب ديناميكيًا
//   credentials: true,
// }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// التأكد من وجود مجلد uploads داخل backend
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("📁 تم إنشاء مجلد uploads في backend");
}

// Serve uploaded files من backend/uploads
app.use("/uploads", express.static(uploadsDir));

// تعريف المسارات
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/comments", require("./routes/comment"));
app.use("/api/follow", require("./routes/follow"));
app.use("/api/notifications", require("./routes/notification"));

// صفحة الترحيب
app.get("/", (req, res) => {
    res.json({
        message: "مرحباً في TechFolio API",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            users: "/api/users",
            projects: "/api/projects",
            comments: "/api/comments",
            follow: "/api/follow",
            notifications: "/api/notifications",
        },
    });
});

// التعامل مع الصفحات غير الموجودة
app.use((req, res) => {
    res.status(404).json({ message: "الصفحة غير موجودة" });
});

// Middleware للتعامل مع الأخطاء
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "حدث خطأ في الخادم",
        error: process.env.NODE_ENV === "development" ? err.message : {},
    });
});

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ الخادم يعمل على http://localhost:${PORT}`);
    console.log(`📁 قاعدة البيانات: ${process.env.MONGODB_URI}`);
});
