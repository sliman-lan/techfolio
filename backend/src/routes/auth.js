const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// توليد JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "techfolio_secret_key", {
        expiresIn: "30d",
    });
};

// @route   POST /api/auth/register
// @desc    تسجيل مستخدم جديد
// @access  Public
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // التحقق من وجود المستخدم
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "البريد الإلكتروني مسجل مسبقاً",
            });
        }

        // إنشاء المستخدم
        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            const token = generateToken(user._id);
            console.log("🔑 Issued token (register):", token);
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token,
                },
            });
        }
    } catch (error) {
        console.error("Error in POST /api/auth/register:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
});

// @route   POST /api/auth/login
// @desc    تسجيل الدخول
// @access  Public
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // التحقق من وجود المستخدم
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
            });
        }

        // التحقق من كلمة المرور
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
            });
        }

        const token = generateToken(user._id);
        console.log("🔑 Issued token (login):", token);
        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token,
            },
        });
    } catch (error) {
        console.error("Error in POST /api/auth/login:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
});

// @route   GET /api/auth/me
// @desc    الحصول على بيانات المستخدم الحالي
// @access  Private
router.get("/me", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "غير مصرح، لا يوجد رمز",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "techfolio_secret_key",
        );
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "المستخدم غير موجود",
            });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("Error in GET /api/auth/me:", error);
        res.status(401).json({
            success: false,
            message: "غير مصرح، فشل التحقق من الرمز",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
});
// backend/src/routes/authRoutes.js - أضف هذه الـ endpoint
router.get("/verify-token", (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(400).json({
                success: false,
                message: "التوكن غير مرفق",
            });
        }

        const token = authHeader.split(" ")[1];

        // التحقق من التوكن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        res.json({
            success: true,
            message: "التوكن صالح",
            data: decoded,
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "التوكن غير صالح",
            error: error.message,
        });
    }
});

// @route   POST /api/auth/change-password
// @desc    تغيير كلمة المرور للمستخدم الحالي
// @access  Private
router.post("/change-password", protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "مطلوب: currentPassword و newPassword",
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "المستخدم غير موجود" });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "كلمة المرور الحالية غير صحيحة",
                });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error) {
        console.error("Error in POST /api/auth/change-password:", error);
        res.status(500).json({ success: false, message: "حدث خطأ في الخادم" });
    }
});
module.exports = router;
