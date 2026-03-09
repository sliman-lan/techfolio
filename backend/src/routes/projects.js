const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Project = require("../models/Project");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { isAdmin, isTeacher, isAdminOrTeacher } = require("../middleware/roles");

// إعداد multer لرفع الصور
const storage = multer.diskStorage({
    destination: (req, file, cb) =>
        cb(null, path.join(__dirname, "..", "uploads")),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-\_]/g, "_");
        cb(null, `${unique}-${safeName}`);
    },
});
const upload = multer({ storage });

// ========== المسارات العامة ==========
router.get("/", async (req, res) => {
    try {
        const { userId, category, q } = req.query;
        const filter = { status: "approved" };
        if (userId) filter.userId = userId;
        if (category) filter.category = category;

        if (q) {
            const regex = { $regex: q, $options: "i" };
            const matchedUsers = await User.find({ name: regex }).select("_id");
            const authorIds = matchedUsers.map((u) => u._id);
            const or = [{ title: regex }];
            if (authorIds.length) or.push({ userId: { $in: authorIds } });
            filter.$or = or;
        }

        const projects = await Project.find(filter)
            .populate("userId", "name avatar")
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== مسارات محمية (يجب أن تأتي قبل المسارات الديناميكية) ==========

// ✅ مسار مشاريع المستخدم الحالي (ثابت)
router.get("/my", protect, async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user._id })
            .populate("userId", "name avatar")
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        console.error("خطأ في /projects/my:", error);
        res.status(500).json({ message: error.message });
    }
});

// ✅ مسار المشاريع المعلقة (للمشرف)
router.get("/admin/pending", protect, isAdmin, async (req, res) => {
    try {
        const projects = await Project.find({ status: "pending" })
            .populate("userId", "name email")
            .sort({ createdAt: 1 });
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ جميع المشاريع (للمشرف)
router.get("/admin/all", protect, isAdmin, async (req, res) => {
    try {
        const projects = await Project.find({})
            .populate("userId", "name email avatar role")
            .sort({ createdAt: -1 });
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/projects/featured
// @desc    الحصول على المشاريع المميزة (أعلى تقييماً)
// @access  Public
router.get("/featured", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;

        // جلب المشاريع المقبولة، مرتبة حسب averageRating تنازلياً، ثم عدد التقييمات، ثم الأحدث
        const featuredProjects = await Project.find({ status: "approved" })
            .populate("userId", "name avatar")
            .sort({ averageRating: -1, totalRatings: -1, createdAt: -1 })
            .limit(limit);

        res.json(featuredProjects);
    } catch (error) {
        console.error("❌ Error fetching featured projects:", error);
        res.status(500).json({ message: error.message });
    }
});

// ========== المسارات الديناميكية (تأتي بعد الثابتة) ==========
router.get("/:id", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("userId", "name avatar email")
            .populate("ratings.userId", "name");
        if (!project || project.status !== "approved") {
            return res.status(404).json({ message: "المشروع غير موجود" });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/projects/rated-by/:userId
// @desc    الحصول على المشاريع التي قيمها مستخدم معين
// @access  Private (يمكن للمعلم نفسه أو المشرف)
router.get("/rated-by/:userId", protect, async (req, res) => {
    try {
        const userId = req.params.userId;
        // يمكن إضافة صلاحية: فقط المستخدم نفسه أو المشرف
        if (req.user._id.toString() !== userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "غير مصرح" });
        }

        // البحث عن المشاريع التي تحتوي ratings على userId
        const projects = await Project.find({
            "ratings.userId": userId,
            status: "approved", // اختياري: عرض المقبول فقط
        })
            .populate("userId", "name avatar")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: projects });
    } catch (error) {
        console.error("❌ Error fetching rated projects:", error);
        res.status(500).json({ message: error.message });
    }
});
// تعديل مسار إنشاء المشروع لمعالجة أخطاء multer بشكل صحيح
router.post(
    "/",
    protect,
    (req, res, next) => {
        // استدعاء multer middleware يدويًا مع معالج أخطاء
        upload.array("images", 6)(req, res, (err) => {
            if (err) {
                console.error("Multer error:", err);
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    },
    async (req, res) => {
        // التحقق من دور المستخدم
        if (req.user.role !== "student") {
            return res
                .status(403)
                .json({ message: "فقط الطلاب يمكنهم إنشاء مشاريع" });
        }

        try {
            // إنشاء كائن المشروع
            const project = new Project({
                title: req.body.title,
                description: req.body.description,
                shortDescription: req.body.shortDescription,
                category: req.body.category || "web",
                demoUrl: req.body.demoUrl,
                githubUrl: req.body.githubUrl,
                userId: req.user._id,
                status: "pending",
            });

            // معالجة الصور المرفوعة
            if (req.files && req.files.length > 0) {
                const baseUrl = `${req.protocol}://${req.get("host")}`;
                project.images = req.files.map(
                    (f) => `${baseUrl}/uploads/${f.filename}`,
                );
            }

            // حفظ المشروع
            const saved = await project.save();
            res.status(201).json(saved);
        } catch (error) {
            console.error("Error saving project:", error);
            res.status(400).json({ message: error.message });
        }
    },
);

// @route   PUT /api/projects/:id
// @desc    تحديث مشروع
// @access  Private (owner only)
router.put("/:id", protect, upload.array("images", 6), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "المشروع غير موجود" });
        }

        if (project.userId.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "غير مصرح لك بتعديل هذا المشروع" });
        }

        // تخزين الصور القديمة للمقارنة لاحقًا
        const oldImages = [...project.images];
        console.log("🖼️ Old images:", oldImages);

        // تحديث الحقول النصية
        const allowedUpdates = [
            "title",
            "description",
            "shortDescription",
            "category",
            "level",
            "demoUrl",
            "githubUrl",
            "videoUrl",
            "tags",
            "technologies",
            "isPublic",
            "status",
        ];

        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                if (field === "tags" || field === "technologies") {
                    try {
                        project[field] = JSON.parse(req.body[field]);
                    } catch {
                        project[field] = req.body[field];
                    }
                } else {
                    project[field] = req.body[field];
                }
            }
        });

        // ========== معالجة الصور ==========
        // إذا تم إرسال existingImages، فهذا يعني أن المستخدم قام بتعديل الصور (حذف بعضها)
        if (req.body.existingImages !== undefined) {
            try {
                const imagesToKeep = JSON.parse(req.body.existingImages);
                console.log("🖼️ Images to keep:", imagesToKeep);
                project.images = imagesToKeep; // تعيين الصور المحتفظ بها
            } catch (e) {
                console.error("❌ Failed to parse existingImages:", e);
                return res
                    .status(400)
                    .json({ message: "بيانات الصور غير صالحة" });
            }
        } else {
            // إذا لم يتم إرسال existingImages، فهذا يعني أن المستخدم لم يغير الصور، فنحتفظ بالصور القديمة
            console.log("🖼️ No existingImages sent, keeping old images");
            // لا تغير project.images
        }

        // إضافة الصور الجديدة (إذا وجدت)
        const newFiles = req.files || [];
        console.log("🖼️ New files count:", newFiles.length);

        if (newFiles.length > 0) {
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            const newImages = newFiles.map(
                (f) => `${baseUrl}/uploads/${f.filename}`,
            );
            project.images = [...project.images, ...newImages];
            console.log("🖼️ New images added:", newImages);
        }

        // حفظ المشروع
        const updatedProject = await project.save();
        console.log("✅ Project saved. Final images:", project.images);

        // حذف الصور القديمة التي لم تعد موجودة في project.images
        if (oldImages.length > 0) {
            const imagesToDelete = oldImages.filter(
                (oldImg) =>
                    !project.images.includes(oldImg) &&
                    !oldImg.includes("default-avatar"),
            );

            console.log("🗑️ Images to delete:", imagesToDelete);

            imagesToDelete.forEach((imgUrl) => {
                const filename = imgUrl.split("/").pop();
                const filePath = path.join(
                    __dirname,
                    "..",
                    "uploads",
                    filename,
                );
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`🗑️ تم حذف الصورة: ${filename}`);
                }
            });
        }

        res.json(updatedProject);
    } catch (error) {
        console.error("❌ Error updating project:", error);
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:id", protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "المشروع غير موجود" });
        }

        // التحقق من الصلاحية (المالك أو المشرف)
        const isOwner = project.userId.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res
                .status(403)
                .json({ message: "غير مصرح لك بحذف هذا المشروع" });
        }

        // ✅ استخدم deleteOne() بدلاً من remove()
        await project.deleteOne();
        // أو يمكنك استخدام:
        // await Project.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "تم حذف المشروع بنجاح",
        });
    } catch (error) {
        console.error("❌ Error deleting project:", error);
        res.status(500).json({ message: error.message });
    }
});
router.post("/:id/rate", protect, isTeacher, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project || project.status !== "approved") {
            return res.status(404).json({ message: "المشروع غير موجود" });
        }
        const existing = project.ratings.find(
            (r) => r.userId.toString() === req.user._id.toString(),
        );
        if (existing) {
            return res
                .status(400)
                .json({ message: "لقد قمت بتقييم هذا المشروع مسبقاً" });
        }
        project.ratings.push({
            userId: req.user._id,
            value: req.body.value,
            comment: req.body.comment,
        });
        project.calculateAverageRating();
        await project.save();
        res.json({ message: "تم إضافة التقييم", project });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/projects/:id/review
// @desc    مراجعة مشروع (قبول أو رفض)
// @access  Private (Admin only)
router.put("/:id/review", protect, isAdmin, async (req, res) => {
    try {
        const { action, rejectionReason } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "المشروع غير موجود" });
        }

        if (action === "approve") {
            project.status = "approved";
            project.rejectionReason = undefined;
        } else if (action === "reject") {
            project.status = "rejected";
            project.rejectionReason = rejectionReason || "لم يتم تقديم سبب";
        } else {
            return res.status(400).json({ message: "إجراء غير صالح" });
        }

        await project.save();

        res.json({
            success: true,
            message: `تم ${action === "approve" ? "قبول" : "رفض"} المشروع بنجاح`,
            data: project,
        });
    } catch (error) {
        console.error("❌ Error in project review:", error);
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/projects/:id/views
// @desc    زيادة عدد مشاهدات المشروع
// @access  Public
router.post("/:id/views", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "المشروع غير موجود",
            });
        }

        // زيادة عدد المشاهدات
        project.views = (project.views || 0) + 1;
        project.lastViewed = Date.now();

        await project.save();

        res.json({
            success: true,
            message: "تم زيادة عدد المشاهدات",
            views: project.views,
        });
    } catch (error) {
        console.error("❌ Error incrementing views:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   GET /api/projects/admin/:id
// @desc    الحصول على مشروع معين (للمشرف - يشمل جميع الحالات)
// @access  Private (Admin only)
router.get("/admin/:id", protect, isAdmin, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("userId", "name avatar email")
            .populate("ratings.userId", "name");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "المشروع غير موجود",
            });
        }

        res.json({
            success: true,
            data: project,
        });
    } catch (error) {
        console.error("❌ Error fetching project for admin:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;
