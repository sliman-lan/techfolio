// backend/src/controllers/notificationController.js
const Notification = require("../models/Notification");

// @desc    الحصول على الإشعارات
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments({
            userId: req.user._id,
        });
        const unreadCount = await Notification.countDocuments({
            userId: req.user._id,
            isRead: false,
        });

        res.json({
            success: true,
            data: notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            unreadCount,
        });
    } catch (error) {
        console.error("Error in getNotifications:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
};

// @desc    وضع علامة كمقروء على إشعار
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "الإشعار غير موجود",
            });
        }

        // التحقق من ملكية الإشعار
        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "ليس لديك صلاحية",
            });
        }

        notification.isRead = true;
        await notification.save();

        res.json({
            success: true,
            data: notification,
        });
    } catch (error) {
        console.error("Error in markAsRead:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
};

// @desc    وضع علامة كمقروء على جميع الإشعارات
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true },
        );

        res.json({
            success: true,
            message: "تم وضع علامة على جميع الإشعارات كمقروءة",
        });
    } catch (error) {
        console.error("Error in markAllAsRead:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
};

// @desc    حذف إشعار
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "الإشعار غير موجود",
            });
        }

        // التحقق من ملكية الإشعار
        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "ليس لديك صلاحية",
            });
        }

        await Notification.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "تم حذف الإشعار بنجاح",
        });
    } catch (error) {
        console.error("Error in deleteNotification:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
};

// @desc    حذف جميع الإشعارات
// @route   DELETE /api/notifications/clear
// @access  Private
const clearAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.user._id });

        res.json({
            success: true,
            message: "تم حذف جميع الإشعارات بنجاح",
        });
    } catch (error) {
        console.error("Error in clearAllNotifications:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
};
