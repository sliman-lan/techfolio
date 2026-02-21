const express = require("express");
const router = express.Router();
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

router.put("/:id", protect, upload.array("images", 6), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project)
            return res.status(404).json({ message: "المشروع غير موجود" });
        if (project.userId.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "غير مصرح لك بتعديل هذا المشروع" });
        }
        if (project.status !== "pending") {
            return res
                .status(400)
                .json({ message: "لا يمكن تعديل مشروع تمت مراجعته" });
        }
        Object.assign(project, req.body);
        if (req.files?.length) {
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            project.images.push(
                ...req.files.map((f) => `${baseUrl}/uploads/${f.filename}`),
            );
        }
        const updated = await project.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete("/:id", protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project)
            return res.status(404).json({ message: "المشروع غير موجود" });
        const isOwner = project.userId.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) {
            return res
                .status(403)
                .json({ message: "غير مصرح بحذف هذا المشروع" });
        }
        await project.remove();
        res.json({ message: "تم الحذف بنجاح" });
    } catch (error) {
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

router.put("/:id/review", protect, isAdmin, async (req, res) => {
    try {
        const { action, rejectionReason } = req.body;
        const project = await Project.findById(req.params.id);
        if (!project)
            return res.status(404).json({ message: "المشروع غير موجود" });
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
            message: `تم ${action === "approve" ? "قبول" : "رفض"} المشروع`,
            project,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
