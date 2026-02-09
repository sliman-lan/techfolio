// backend/routes/like.js
const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// @route   POST /api/projects/:projectId/like
// @desc    إعجاب بمشروع
router.post("/:projectId/like", protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "المشروع غير موجود",
            });
        }

        // التحقق من الإعجاب مسبقاً (مقارنة كسلاسل لتجنب اختلاف أنواع ObjectId)
        const userIdStr = req.user._id.toString();
        const alreadyLiked = project.likes
            .map((id) => id.toString())
            .includes(userIdStr);

        if (alreadyLiked) {
            return res.status(400).json({
                success: false,
                message: "لقد أعجبت بهذا المشروع بالفعل",
            });
        }

        // إضافة الإعجاب
        project.likes.push(req.user._id);
        project.likesCount = project.likes.length;
        await project.save();

        res.json({
            success: true,
            message: "تم الإعجاب بالمشروع",
            likesCount: project.likesCount,
            isLiked: true,
        });
    } catch (error) {
        console.error("❌ خطأ في الإعجاب:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
        });
    }
});

// @route   DELETE /api/projects/:projectId/like
// @desc    إلغاء إعجاب بمشروع
router.delete("/:projectId/like", protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "المشروع غير موجود",
            });
        }

        // التحقق من الإعجاب (مقارنة كسلاسل)
        const userIdStr = req.user._id.toString();
        const likedIndex = project.likes.findIndex(
            (id) => id.toString() === userIdStr,
        );

        if (likedIndex === -1) {
            return res.status(400).json({
                success: false,
                message: "لم تعجب بهذا المشروع",
            });
        }

        // إزالة الإعجاب
        project.likes.splice(likedIndex, 1);
        project.likesCount = project.likes.length;
        await project.save();

        res.json({
            success: true,
            message: "تم إلغاء الإعجاب",
            likesCount: project.likesCount,
            isLiked: false,
        });
    } catch (error) {
        console.error("❌ خطأ في إلغاء الإعجاب:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
        });
    }
});

// @route   GET /api/projects/:projectId/like/status
// @desc    التحقق من حالة الإعجاب
router.get("/:projectId/like/status", protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "المشروع غير موجود",
            });
        }

        const isLiked = project.likes.includes(req.user._id);

        res.json({
            success: true,
            isLiked,
            likesCount: project.likesCount || 0,
        });
    } catch (error) {
        console.error("❌ خطأ في التحقق من حالة الإعجاب:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
        });
    }
});

module.exports = router;
