// backend/src/routes/notification.js
const express = require("express");
const router = express.Router();
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

// الحصول على الإشعارات
router.get("/", protect, getNotifications);

// وضع علامة كمقروء
router.put("/:id/read", protect, markAsRead);

// وضع علامة على جميع الإشعارات كمقروءة
router.put("/read-all", protect, markAllAsRead);

// حذف إشعار
router.delete("/:id", protect, deleteNotification);

// حذف جميع الإشعارات
router.delete("/clear", protect, clearAllNotifications);

module.exports = router;
