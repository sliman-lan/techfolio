// api/server.js
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");

dotenv.config();

const app = express();

// ✅ CORS متقدم لجميع المنافذ
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "https://techfolio-kohl.vercel.app",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }),
);

app.options("*", cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ اتصال MongoDB المحسّن لـ Vercel
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        console.log("✅ استخدام اتصال MongoDB موجود");
        return cached.conn;
    }

    if (!cached.promise) {
        console.log("🔄 إنشاء اتصال جديد بـ MongoDB...");
        cached.promise = mongoose
            .connect(process.env.MONGODB_URI, {
                bufferCommands: false,
            })
            .then((mongoose) => {
                console.log("✅ تم الاتصال بـ MongoDB بنجاح");
                return mongoose;
            })
            .catch((err) => {
                console.error("❌ فشل اتصال MongoDB:", err);
                throw err;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

// ✅ استيراد المسارات
const authRoutes = require("../routes/auth");
const usersRoutes = require("../routes/users");
const projectsRoutes = require("../routes/projects");
const likeRoutes = require("../routes/like");
const followRoutes = require("../routes/follow");
const commentRoutes = require("../routes/comment");
const notificationRoutes = require("../routes/notification");

// ✅ استخدام المسارات مع التأكد من اتصال قاعدة البيانات
app.use(
    "/api/auth",
    async (req, res, next) => {
        try {
            await connectDB();
            next();
        } catch (err) {
            res.status(500).json({ error: "فشل الاتصال بقاعدة البيانات" });
        }
    },
    authRoutes,
);

app.use(
    "/api/users",
    async (req, res, next) => {
        try {
            await connectDB();
            next();
        } catch (err) {
            res.status(500).json({ error: "فشل الاتصال بقاعدة البيانات" });
        }
    },
    usersRoutes,
);

app.use(
    "/api/projects",
    async (req, res, next) => {
        try {
            await connectDB();
            next();
        } catch (err) {
            res.status(500).json({ error: "فشل الاتصال بقاعدة البيانات" });
        }
    },
    projectsRoutes,
);

app.use(
    "/api/follow",
    async (req, res, next) => {
        try {
            await connectDB();
            next();
        } catch (err) {
            res.status(500).json({ error: "فشل الاتصال بقاعدة البيانات" });
        }
    },
    followRoutes,
);

app.use(
    "/api/comments",
    async (req, res, next) => {
        try {
            await connectDB();
            next();
        } catch (err) {
            res.status(500).json({ error: "فشل الاتصال بقاعدة البيانات" });
        }
    },
    commentRoutes,
);

app.use(
    "/api/notifications",
    async (req, res, next) => {
        try {
            await connectDB();
            next();
        } catch (err) {
            res.status(500).json({ error: "فشل الاتصال بقاعدة البيانات" });
        }
    },
    notificationRoutes,
);

// صفحة الترحيب
app.get("/", (req, res) => {
    res.json({
        message: "TechFolio API is running on Vercel",
        time: new Date().toISOString(),
    });
});

// صفحة اختبار
app.get("/api/test", async (req, res) => {
    try {
        await connectDB();
        res.json({
            status: "success",
            message: "API working",
            db: "connected",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Database connection failed",
            error: error.message,
        });
    }
});

// ✅ للاختبار المحلي فقط
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        connectDB();
    });
}

module.exports = app;
