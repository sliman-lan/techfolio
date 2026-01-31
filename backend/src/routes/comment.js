// backend/src/routes/comment.js
const express = require("express");
const router = express.Router();
const {
    addComment,
    getProjectComments,
    updateComment,
    deleteComment,
    toggleLike,
} = require("../controllers/commentController");
const { protect } = require("../middleware/auth");

// إضافة تعليق
router.post("/", protect, addComment);

// الحصول على تعليقات مشروع
router.get("/project/:projectId", getProjectComments);

// تحديث تعليق
router.put("/:id", protect, updateComment);

// حذف تعليق
router.delete("/:id", protect, deleteComment);

// إضافة/إزالة إعجاب
router.post("/:id/like", protect, toggleLike);

module.exports = router;
