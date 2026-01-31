// backend/src/middleware/auth.js
const jwt = require("jsonwebtoken");

// تأكد من تحميل المتغيرات البيئية
require("dotenv").config({
    path: require("path").resolve(__dirname, "../../.env"),
});

console.log("🔐 تهيئة middleware المصادقة...");
console.log("🔐 JWT_SECRET:", process.env.JWT_SECRET ? "محدد" : "غير محدد");

const protect = async (req, res, next) => {
    console.log("\n=== 🔒 مصادقة طلب ===");
    console.log(`📨 ${req.method} ${req.originalUrl}`);

    try {
        // 1. التحقق من وجود التوكن
        if (!req.headers.authorization) {
            console.log("❌ لا يوجد رأس Authorization");
            return res.status(401).json({
                success: false,
                message: "غير مصرح به. يرجى تسجيل الدخول.",
            });
        }

        // 2. استخراج التوكن
        const authHeader = req.headers.authorization;
        if (!authHeader.startsWith("Bearer ")) {
            console.log('❌ التنسيق غير صحيح. يجب أن يبدأ بـ "Bearer "');
            return res.status(401).json({
                success: false,
                message: "تنسيق التوكن غير صحيح",
            });
        }

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

        // 3. التحقق من JWT_SECRET
        if (!process.env.JWT_SECRET) {
            console.error("❌ خطأ جسيم: JWT_SECRET غير محدد في البيئة");
            return res.status(500).json({
                success: false,
                message: "خطأ في إعدادات الخادم",
            });
        }

        // 4. التحقق من التوكن مع معالجة الأخطاء
        console.log("🔐 جاري التحقق من التوكن...");
        console.log("🔐 طول JWT_SECRET:", process.env.JWT_SECRET.length);

        try {
            // محاولة التحقق مع خوارزمية محددة
            const decoded = jwt.verify(token, process.env.JWT_SECRET, {
                algorithms: ["HS256"],
            });

            console.log("✅ التحقق ناجح!");
            console.log("👤 بيانات المستخدم:", {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name,
            });

            // 5. إضافة المستخدم إلى الطلب
            req.user = {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name,
            };

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
                    debug: {
                        tokenPreview: token.substring(0, 50),
                        secretLength: process.env.JWT_SECRET?.length,
                        decoded: decodedWithoutVerify,
                    },
                });
            } else if (jwtError.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "انتهت صلاحية التوكن",
                    error: jwtError.message,
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: "خطأ في المصادقة",
                    error: jwtError.message,
                });
            }
        }
    } catch (error) {
        console.error("❌ خطأ غير متوقع في middleware:", error);
        return res.status(500).json({
            success: false,
            message: "خطأ داخلي في الخادم",
            error: error.message,
        });
    }
};

module.exports = { protect };
