// backend/src/controllers/followController.js
const Follow = require("../models/Follow");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    متابعة مستخدم
// @route   POST /api/follow/:userId
// @access  Private
const followUser = async (req, res) => {
    try {
        const followingId = req.params.userId;
        const followerId = req.user._id;

        // التحقق من عدم متابعة نفسه
        if (followingId.toString() === followerId.toString()) {
            return res.status(400).json({
                success: false,
                message: "لا يمكنك متابعة نفسك",
            });
        }

        // التحقق من وجود المستخدم
        const userToFollow = await User.findById(followingId);
        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: "المستخدم غير موجود",
            });
        }

        // التحقق إذا كان يتابعه مسبقاً
        const existingFollow = await Follow.findOne({
            follower: followerId,
            following: followingId,
        });

        if (existingFollow) {
            return res.status(400).json({
                success: false,
                message: "أنت تتابع هذا المستخدم مسبقاً",
            });
        }

        // إنشاء المتابعة
        const follow = await Follow.create({
            follower: followerId,
            following: followingId,
        });

        // إنشاء إشعار للمستخدم الذي تم متابعته
        await Notification.create({
            userId: followingId,
            type: "follow",
            message: `بدأ ${req.user.name} بمتابعتك`,
            relatedId: followerId,
            relatedType: "User",
        });

        res.status(201).json({
            success: true,
            message: "تمت المتابعة بنجاح",
            data: follow,
        });
    } catch (error) {
        console.error("Error in followUser:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
};

// @desc    إلغاء المتابعة
// @route   DELETE /api/follow/:userId
// @access  Private
const unfollowUser = async (req, res) => {
    try {
        const followingId = req.params.userId;
        const followerId = req.user._id;

        const follow = await Follow.findOneAndDelete({
            follower: followerId,
            following: followingId,
        });

        if (!follow) {
            return res.status(404).json({
                success: false,
                message: "المتابعة غير موجودة",
            });
        }

        res.json({
            success: true,
            message: "تم إلغاء المتابعة بنجاح",
        });
    } catch (error) {
        console.error("Error in unfollowUser:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
};

// @desc    الحصول على المتابعين
// @route   GET /api/follow/followers/:userId
// @access  Public
const getFollowers = async (req, res) => {
    try {
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const follows = await Follow.find({ following: userId })
            .populate("follower", "name avatar bio")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Follow.countDocuments({ following: userId });

        res.json({
            success: true,
            data: follows,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error in getFollowers:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
};

// @desc    الحصول على المستخدمين الذين يتابعهم
// @route   GET /api/follow/following/:userId
// @access  Public
const getFollowing = async (req, res) => {
    try {
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const follows = await Follow.find({ follower: userId })
            .populate("following", "name avatar bio")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Follow.countDocuments({ follower: userId });

        res.json({
            success: true,
            data: follows,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error in getFollowing:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
};

// @desc    التحقق إذا كان المستخدم يتابع
// @route   GET /api/follow/check/:userId
// @access  Private
const checkFollowStatus = async (req, res) => {
    try {
        const followingId = req.params.userId;
        const followerId = req.user._id;

        const follow = await Follow.findOne({
            follower: followerId,
            following: followingId,
        });

        res.json({
            success: true,
            data: {
                isFollowing: !!follow,
            },
        });
    } catch (error) {
        console.error("Error in checkFollowStatus:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    checkFollowStatus,
};
