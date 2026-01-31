// backend/src/models/Comment.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: [true, "المحتوى مطلوب"],
            maxlength: 500,
        },
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("Comment", commentSchema);
