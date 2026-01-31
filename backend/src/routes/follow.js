// backend/src/routes/follow.js
const express = require("express");
const router = express.Router();
const {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    checkFollowStatus,
} = require("../controllers/followController");
const { protect } = require("../middleware/auth");

// متابعة مستخدم
router.post("/:userId", protect, followUser);

// إلغاء المتابعة
router.delete("/:userId", protect, unfollowUser);

// الحصول على المتابعين
router.get("/followers/:userId", getFollowers);

// الحصول على المستخدمين الذين يتابعهم
router.get("/following/:userId", getFollowing);

// التحقق من حالة المتابعة
router.get("/check/:userId", protect, checkFollowStatus);

module.exports = router;
