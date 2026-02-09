// backend/src/controllers/commentController.js
const Comment = require("../models/Comment");
const Project = require("../models/Project");
const Notification = require("../models/Notification");

// @desc    إضافة تعليق
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res) => {
    try {
        const { projectId, content, parentComment } = req.body;

        // التحقق من وجود المشروع
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "المشروع غير موجود",
            });
        }

        // إنشاء التعليق
        const comment = await Comment.create({
            projectId,
            userId: req.user._id,
            content,
            parentComment,
        });

        // إنشاء إشعار لصاحب المشروع
        if (!parentComment) {
            await Notification.create({
                userId: project.userId,
                type: "comment",
                message: `${req.user.name} علق على مشروعك: ${project.title}`,
                relatedId: comment._id,
                relatedType: "Comment",
            });
        }

        // إذا كان رد على تعليق، إشعار لصاحب التعليق الأصلي
        if (parentComment) {
            const parent = await Comment.findById(parentComment);
            if (
                parent &&
                parent.userId.toString() !== req.user._id.toString()
            ) {
                await Notification.create({
                    userId: parent.userId,
                    type: "comment",
                    message: `${req.user.name} رد على تعليقك`,
                    relatedId: comment._id,
                    relatedType: "Comment",
                });
            }
        }

        const populatedComment = await Comment.findById(comment._id)
            .populate("userId", "name avatar")
            .populate("parentComment", "content userId");

        // Normalize response shape for clients that expect `user` and `text`
        const responseComment = {
            _id: populatedComment._id,
            user: populatedComment.userId || null,
            userId: populatedComment.userId || null,
            text: populatedComment.content,
            content: populatedComment.content,
            parentComment: populatedComment.parentComment || null,
            likesCount: (populatedComment.likes || []).length,
            likes: populatedComment.likes || [],
            createdAt: populatedComment.createdAt,
        };

        res.status(201).json({
            success: true,
            data: responseComment,
        });
    } catch (error) {
        console.error("Error in addComment:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
};

// @desc    الحصول على تعليقات مشروع
// @route   GET /api/comments/project/:projectId
// @access  Public
const getProjectComments = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // الحصول على التعليقات الرئيسية فقط
        const comments = await Comment.find({
            projectId,
            $or: [
                { parentComment: { $exists: false } },
                { parentComment: null },
            ],
        })
            .populate("userId", "name avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // الحصول على الردود لكل تعليق و normalize
        const normalizedComments = [];
        for (let comment of comments) {
            const replies = await Comment.find({ parentComment: comment._id })
                .populate("userId", "name avatar")
                .sort({ createdAt: 1 });

            const mappedReplies = replies.map((r) => ({
                _id: r._id,
                user: r.userId || null,
                userId: r.userId || null,
                text: r.content,
                content: r.content,
                parentComment: r.parentComment || null,
                likesCount: (r.likes || []).length,
                likes: r.likes || [],
                createdAt: r.createdAt,
            }));

            normalizedComments.push({
                _id: comment._id,
                user: comment.userId || null,
                userId: comment.userId || null,
                text: comment.content,
                content: comment.content,
                parentComment: comment.parentComment || null,
                likesCount: (comment.likes || []).length,
                likes: comment.likes || [],
                createdAt: comment.createdAt,
                replies: mappedReplies,
            });
        }

        const total = await Comment.countDocuments({
            projectId,
            $or: [
                { parentComment: { $exists: false } },
                { parentComment: null },
            ],
        });

        res.json({
            success: true,
            data: normalizedComments,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error in getProjectComments:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
};

// @desc    تحديث تعليق
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "التعليق غير موجود",
            });
        }

        // التحقق من ملكية التعليق
        if (comment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "ليس لديك صلاحية لتعديل هذا التعليق",
            });
        }

        comment.content = req.body.content;
        await comment.save();

        const updatedComment = await Comment.findById(comment._id).populate(
            "userId",
            "name avatar",
        );

        res.json({
            success: true,
            data: updatedComment,
        });
    } catch (error) {
        console.error("Error in updateComment:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
};

// @desc    حذف تعليق
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "التعليق غير موجود",
            });
        }

        // التحقق من ملكية التعليق أو صلاحية المشرف
        if (
            comment.userId.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "ليس لديك صلاحية لحذف هذا التعليق",
            });
        }

        // حذف الردود المرتبطة
        await Comment.deleteMany({ parentComment: comment._id });

        await Comment.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "تم حذف التعليق بنجاح",
        });
    } catch (error) {
        console.error("Error in deleteComment:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
};

// @desc    إضافة أو إزالة إعجاب على تعليق
// @route   POST /api/comments/:id/like
// @access  Private
const toggleLike = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "التعليق غير موجود",
            });
        }

        const userId = req.user._id;
        const likeIndex = comment.likes.findIndex(
            (id) => id.toString() === userId.toString(),
        );

        if (likeIndex > -1) {
            // إزالة الإعجاب
            comment.likes.splice(likeIndex, 1);
        } else {
            // إضافة إعجاب
            comment.likes.push(userId);
        }

        await comment.save();

        res.json({
            success: true,
            data: {
                likesCount: comment.likes.length,
                isLiked: likeIndex === -1,
            },
        });
    } catch (error) {
        console.error("Error in toggleLike:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في الخادم",
            error: process.env.NODE_ENV !== "production" ? error.message : {},
        });
    }
};

module.exports = {
    addComment,
    getProjectComments,
    updateComment,
    deleteComment,
    toggleLike,
};
