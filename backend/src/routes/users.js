const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// التأكد من وجود مجلد uploads/avatars
const uploadDir = path.join(__dirname, "..", "uploads", "avatars");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 تم إنشاء مجلد uploads/avatars");
}

// إعداد تخزين الصور
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${req.user._id}-${unique}${ext}`);
    },
});

// فلترة الملفات (قبول الصور فقط)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("الملف يجب أن يكون صورة"), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter,
});

// @route   GET /api/users
// @desc    الحصول على جميع المستخدمين
// @access  Public
router.get("/", async (req, res) => {
    try {
        const users = await User.find({ isProfilePublic: true })
            .select("name avatar bio skills certifications")
            .limit(20);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/users/search/:query
// @desc    البحث عن مستخدمين
// @access  Public
router.get("/search/:query", async (req, res) => {
    try {
        const users = await User.find({
            $and: [
                { isProfilePublic: true },
                {
                    $or: [
                        { name: { $regex: req.params.query, $options: "i" } },
                        { skills: { $regex: req.params.query, $options: "i" } },
                        {
                            "certifications.title": {
                                $regex: req.params.query,
                                $options: "i",
                            },
                        },
                    ],
                },
            ],
        })
            .select("name avatar bio skills")
            .limit(10);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/users/:id
// @desc    الحصول على مستخدم معين
// @access  Public
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user || !user.isProfilePublic) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/users/profile
// @desc    تحديث الملف الشخصي (يدعم رفع الصور)
// @access  Private
router.put("/profile", protect, upload.single("avatar"), async (req, res) => {
    try {
        console.log("📝 PUT /api/users/profile called by user:", req.user?._id);
        console.log("🖼️ File:", req.file);

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }

        // تحديث الحقول النصية
        const allowedUpdates = [
            "name",
            "bio",
            "skills",
            "certifications",
            "socialLinks",
            "isProfilePublic",
        ];

        for (const update of allowedUpdates) {
            if (req.body[update] !== undefined) {
                // معالجة خاصة للحقول التي تأتي كـ JSON string
                if (
                    update === "skills" &&
                    typeof req.body[update] === "string"
                ) {
                    try {
                        user[update] = JSON.parse(req.body[update]);
                    } catch {
                        user[update] = req.body[update]
                            .split(",")
                            .map((s) => s.trim());
                    }
                } else if (
                    update === "certifications" &&
                    typeof req.body[update] === "string"
                ) {
                    try {
                        user[update] = JSON.parse(req.body[update]);
                    } catch {
                        user[update] = [];
                    }
                } else if (
                    update === "socialLinks" &&
                    typeof req.body[update] === "string"
                ) {
                    try {
                        user[update] = JSON.parse(req.body[update]);
                    } catch {
                        user[update] = user[update] || {};
                    }
                } else {
                    user[update] = req.body[update];
                }
            }
        }

        // تحديث الصورة إذا تم رفعها
        if (req.file) {
            // حذف الصورة القديمة إذا لم تكن الصورة الافتراضية
            if (
                user.avatar &&
                !user.avatar.includes("default-avatar.png") &&
                user.avatar.includes("/uploads/")
            ) {
                const oldFileName = user.avatar.split("/").pop();
                const oldAvatarPath = path.join(uploadDir, oldFileName);
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                    console.log("🗑️ تم حذف الصورة القديمة:", oldAvatarPath);
                }
            }

            // استخدام مسار نسبي للصورة
            const avatarUrl = `/uploads/avatars/${req.file.filename}`;
            user.avatar = avatarUrl;
            console.log("✅ تم تحديث الصورة:", avatarUrl);
        }

        await user.save();
        console.log("✅ User saved successfully:", user._id);

        // إرجاع البيانات المحدثة
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
            skills: user.skills,
            certifications: user.certifications,
            socialLinks: user.socialLinks,
            isProfilePublic: user.isProfilePublic,
        });
    } catch (error) {
        console.error("❌ Error in PUT /api/users/profile:", error);
        res.status(500).json({
            message: error.message,
            stack:
                process.env.NODE_ENV === "development"
                    ? error.stack
                    : undefined,
        });
    }
});

module.exports = router;
