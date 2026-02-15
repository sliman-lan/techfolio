// backend/src/middleware/admin.js
// Middleware to ensure the authenticated user is an admin
const isAdmin = (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res
                .status(403)
                .json({
                    success: false,
                    message: "ممنوع. مطلوب صلاحية المشرف.",
                });
        }
        next();
    } catch (error) {
        console.error("Error in isAdmin middleware:", error);
        return res
            .status(500)
            .json({ success: false, message: "خطأ داخلي في الخادم" });
    }
};

module.exports = { isAdmin };
