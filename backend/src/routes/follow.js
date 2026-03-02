const express = require("express");
const router = express.Router();
const Follow = require("../models/Follow");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// @route   POST /api/follow/:userId
// @desc    متابعة مستخدم
// @access  Private
router.post("/:userId", protect, async (req, res) => {
    try {
        const { userId } = req.params;
        const followerId = req.user._id;

        // التحقق من أن المستخدم لا يحاول متابعة نفسه
        if (followerId.toString() === userId) {
            return res.status(400).json({
                success: false,
                message: "لا يمكنك متابعة نفسك",
            });
        }

        // التحقق من وجود المستخدم المراد متابعته
        const userToFollow = await User.findById(userId);
        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: "المستخدم غير موجود",
            });
        }

        // التحقق من عدم وجود متابعة سابقة
        const existingFollow = await Follow.findOne({
            follower: followerId,
            following: userId,
        });

        if (existingFollow) {
            return res.status(400).json({
                success: false,
                message: "أنت تتابع هذا المستخدم بالفعل",
            });
        }

        // إنشاء متابعة جديدة
        const follow = await Follow.create({
            follower: followerId,
            following: userId,
        });

        // زيادة عدد المتابعين والمتابعات
        await User.findByIdAndUpdate(userId, { $inc: { followersCount: 1 } });
        await User.findByIdAndUpdate(followerId, {
            $inc: { followingCount: 1 },
        });

        // إنشاء إشعار للمستخدم
        try {
            const Notification = require("../models/Notification");
            await Notification.create({
                userId: userId,
                type: "follow",
                title: "متابعة جديدة",
                message: `${req.user.name} بدأ متابعتك`,
                relatedId: followerId,
                relatedModel: "User",
                actorId: followerId,
            });
        } catch (notifError) {
            console.error("❌ فشل إنشاء إشعار المتابعة:", notifError);
            // لا نوقف العملية إذا فشل الإشعار
        }

        res.status(201).json({
            success: true,
            message: "تمت المتابعة بنجاح",
            data: follow,
        });
    } catch (error) {
        console.error("❌ خطأ في متابعة المستخدم:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   DELETE /api/follow/:userId
// @desc    إلغاء متابعة مستخدم
// @access  Private
router.delete("/:userId", protect, async (req, res) => {
    try {
        const { userId } = req.params;
        const followerId = req.user._id;

        // البحث عن المتابعة وحذفها
        const result = await Follow.findOneAndDelete({
            follower: followerId,
            following: userId,
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "لم يتم العثور على متابعة",
            });
        }

        // تقليل عدد المتابعين والمتابعات
        await User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } });
        await User.findByIdAndUpdate(followerId, {
            $inc: { followingCount: -1 },
        });

        res.json({
            success: true,
            message: "تم إلغاء المتابعة بنجاح",
        });
    } catch (error) {
        console.error("❌ خطأ في إلغاء المتابعة:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   GET /api/follow/check/:userId
// @desc    التحقق من حالة المتابعة
// @access  Private
router.get("/check/:userId", protect, async (req, res) => {
    try {
        const follow = await Follow.findOne({
            follower: req.user._id,
            following: req.params.userId,
        });

        res.json({
            success: true,
            isFollowing: !!follow,
        });
    } catch (error) {
        console.error("❌ خطأ في التحقق من المتابعة:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   GET /api/follow/followers/:userId
// @desc    الحصول على المتابعين
// @access  Public
router.get("/followers/:userId", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const followers = await Follow.find({ following: req.params.userId })
            .populate("follower", "name avatar bio")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Follow.countDocuments({
            following: req.params.userId,
        });

        res.json({
            success: true,
            users: followers.map((f) => f.follower),
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("❌ خطأ في جلب المتابعين:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   GET /api/follow/following/:userId
// @desc    الحصول على المستخدمين الذين يتابعهم
// @access  Public
router.get("/following/:userId", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const following = await Follow.find({ follower: req.params.userId })
            .populate("following", "name avatar bio")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Follow.countDocuments({
            follower: req.params.userId,
        });

        res.json({
            success: true,
            users: following.map((f) => f.following),
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("❌ خطأ في جلب المستخدمين المتابَعين:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;
