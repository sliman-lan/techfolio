// middleware/roles.js
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res
            .status(403)
            .json({ success: false, message: "مطلوب صلاحية المشرف" });
    }
    next();
};

const isTeacher = (req, res, next) => {
    if (!req.user || req.user.role !== "teacher") {
        return res
            .status(403)
            .json({ success: false, message: "مطلوب صلاحية أستاذ" });
    }
    next();
};

const isStudent = (req, res, next) => {
    if (!req.user || req.user.role !== "student") {
        return res
            .status(403)
            .json({ success: false, message: "مطلوب صلاحية طالب" });
    }
    next();
};

// للسماح للمشرف أو الأستاذ معاً
const isAdminOrTeacher = (req, res, next) => {
    if (
        !req.user ||
        (req.user.role !== "admin" && req.user.role !== "teacher")
    ) {
        return res
            .status(403)
            .json({ success: false, message: "غير مصرح بهذا الإجراء" });
    }
    next();
};

module.exports = { isAdmin, isTeacher, isStudent, isAdminOrTeacher };
