const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        content: {
            type: String,
            required: [true, "المحتوى مطلوب"],
            maxlength: 500,
            trim: true,
        },
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        likesCount: { type: Number, default: 0 },
        isEdited: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Indexes
commentSchema.index({ projectId: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

// Virtual for replies
commentSchema.virtual("replies", {
    ref: "Comment",
    localField: "_id",
    foreignField: "parentComment",
});

// Soft delete method
commentSchema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = Date.now();
    return this.save();
};

// Update likes count
commentSchema.methods.updateLikesCount = function () {
    this.likesCount = this.likes.length;
    return this.save();
};

module.exports = mongoose.model("Comment", commentSchema);
