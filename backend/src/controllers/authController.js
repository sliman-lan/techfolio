// backend/src/controllers/authController.js
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// تأكد من وجود JWT_SECRET
if (!process.env.JWT_SECRET) {
    console.error("❌ خطأ: JWT_SECRET غير محدد في البيئة");
    process.exit(1);
}

console.log(
    "🔐 JWT_SECRET جاهز:",
    process.env.JWT_SECRET.substring(0, 10) + "...",
);

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // التحقق من المستخدم...
        // ... (كود التحقق الحالي)

        // 🔥 **مهم: إنشاء التوكن بشكل صحيح**
        const token = jwt.sign(
            {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE || "30d",
                algorithm: "HS256", // ⬅️ حدد الخوارزمية صراحةً
            },
        );

        console.log("🔐 التوكن المنشأ:", {
            tokenPreview: token.substring(0, 30) + "...",
            userId: user._id,
            algorithm: "HS256",
        });

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            },
        });
    } catch (error) {
        console.error("❌ خطأ في تسجيل الدخول:", error);
        res.status(500).json({
            success: false,
            message: "خطأ في الخادم",
        });
    }
};
