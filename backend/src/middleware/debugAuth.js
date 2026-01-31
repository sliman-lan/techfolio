// backend/src/middleware/debugAuth.js
const jwt = require("jsonwebtoken");

const debugAuth = async (req, res, next) => {
    console.log("\n=== 🔍 تصحيح التوكن ===");
    console.log("📨 المسار:", req.path);
    console.log("📨 الطريقة:", req.method);

    // عرض التوكن كاملاً
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        console.log("🔑 التوكن الكامل:", token);
        console.log("🔑 طول التوكن:", token.length);

        // محاولة فك التوكن بدون التحقق من التوقيع
        try {
            const decodedWithoutVerify = jwt.decode(token);
            console.log("🔓 التوكن بعد فك الترميز:", decodedWithoutVerify);

            if (decodedWithoutVerify) {
                console.log(
                    "📅 تاريخ الإصدار (iat):",
                    new Date(decodedWithoutVerify.iat * 1000),
                );
                console.log(
                    "📅 تاريخ الانتهاء (exp):",
                    new Date(decodedWithoutVerify.exp * 1000),
                );
                console.log(
                    "⏰ الوقت المتبقي:",
                    Math.floor(
                        (decodedWithoutVerify.exp * 1000 - Date.now()) /
                            (1000 * 60 * 60 * 24),
                    ),
                    "أيام",
                );
            }
        } catch (decodeError) {
            console.log("❌ خطأ في فك ترميز التوكن:", decodeError.message);
        }

        // التحقق من التوكن مع التوقيع
        try {
            const secret = process.env.JWT_SECRET;
            console.log(
                "🔐 JWT_SECRET المستخدم:",
                secret ? `[${secret.substring(0, 5)}...]` : "غير موجود!",
            );
            console.log("🔐 طول JWT_SECRET:", secret?.length || 0);

            const decoded = jwt.verify(token, secret);
            console.log("✅ التحقق من التوكن ناجح");
            req.user = decoded;
            next();
        } catch (verifyError) {
            console.log("❌ خطأ في التحقق من التوكن:", verifyError.message);
            console.log("❌ نوع الخطأ:", verifyError.name);

            // إرجاع خطأ مفصل
            return res.status(401).json({
                success: false,
                message: "خطأ في التوكن",
                error: {
                    name: verifyError.name,
                    message: verifyError.message,
                    tokenPreview: token.substring(0, 50) + "...",
                },
            });
        }
    } else {
        console.log("❌ لا يوجد توكن في الطلب");
        next();
    }
};

module.exports = debugAuth;
