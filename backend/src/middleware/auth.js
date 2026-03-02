// backend/src/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config({
    path: require("path").resolve(__dirname, "../../.env"),
});

console.log("🔐 تهيئة middleware المصادقة...");
console.log("🔐 JWT_SECRET:", process.env.JWT_SECRET ? "محدد" : "غير محدد");

const protect = async (req, res, next) => {
    console.log("\n=== 🔒 مصادقة طلب ===");
    console.log(`📨 ${req.method} ${req.originalUrl}`);

    try {
        // التحقق من وجود رأس Authorization
        if (!req.headers.authorization) {
            console.log("❌ لا يوجد رأس Authorization");
            return res.status(401).json({
                success: false,
                message: "غير مصرح به. يرجى تسجيل الدخول.",
            });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader.startsWith("Bearer ")) {
            console.log('❌ التنسيق غير صحيح. يجب أن يبدأ بـ "Bearer "');
            return res.status(401).json({
                success: false,
                message: "تنسيق التوكن غير صحيح",
            });
        }

        // استخراج التوكن
        const token = authHeader.split(" ")[1];
        if (!token) {
            console.log('❌ التوكن فارغ بعد "Bearer"');
            return res.status(401).json({
                success: false,
                message: "التوكن غير موجود",
            });
        }

        console.log("🔑 التوكن المستلم:", token.substring(0, 30) + "...");
        console.log("📏 طول التوكن:", token.length);

        // التحقق من JWT_SECRET
        if (!process.env.JWT_SECRET) {
            console.error("❌ خطأ جسيم: JWT_SECRET غير محدد في البيئة");
            return res.status(500).json({
                success: false,
                message: "خطأ في إعدادات الخادم",
            });
        }

        // التحقق من التوكن
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET, {
                algorithms: ["HS256"],
            });

            // جلب المستخدم من قاعدة البيانات
            const userFromDb = await User.findById(decoded.id).select(
                "-password",
            );
            if (!userFromDb) {
                return res.status(401).json({
                    success: false,
                    message: "المستخدم غير موجود",
                });
            }

            req.user = userFromDb;
            req.user._id = userFromDb._id; // للتأكد من وجود _id

            next();
        } catch (jwtError) {
            console.error("❌ خطأ في JWT:", jwtError.message);
            console.error("🔧 نوع الخطأ:", jwtError.name);

            // فك ترميز دون التحقق لمعرفة البيانات
            const decodedWithoutVerify = jwt.decode(token);
            console.log("🔓 البيانات المفكوكة:", decodedWithoutVerify);

            if (jwtError.name === "JsonWebTokenError") {
                return res.status(401).json({
                    success: false,
                    message: "التوكن غير صالح",
                    error: jwtError.message,
                });
            } else if (jwtError.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "انتهت صلاحية التوكن",
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: "خطأ في المصادقة",
                });
            }
        }
    } catch (error) {
        console.error("❌ خطأ غير متوقع في middleware:", error);
        return res.status(500).json({
            success: false,
            message: "خطأ داخلي في الخادم",
        });
    }
};

module.exports = { protect };
