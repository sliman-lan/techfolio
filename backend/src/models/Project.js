const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        shortDescription: { type: String, maxlength: 150, default: "" },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        category: {
            type: String,
            enum: ["web", "mobile", "ai", "design", "game", "other"],
            default: "web",
        },
        level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "intermediate",
        },
        tags: [{ type: String, trim: true }],
        technologies: [{ type: String, trim: true }],
        images: [{ type: String }],
        demoUrl: { type: String, default: "" },
        githubUrl: { type: String, default: "" },
        videoUrl: { type: String, default: "" },
        ratings: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                value: { type: Number, min: 1, max: 5, required: true },
                comment: { type: String, maxlength: 200 },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        totalRatings: { type: Number, default: 0 },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        likesCount: { type: Number, default: 0 },
        commentsCount: { type: Number, default: 0 },
        isFeatured: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true,
        },
        rejectionReason: { type: String, default: "" },
        views: { type: Number, default: 0 },
        lastViewed: { type: Date },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Indexes for better query performance
projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ category: 1, status: 1 });
projectSchema.index({ tags: 1 });

// Virtual for comments
projectSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "projectId",
    count: true,
});

// حساب التقييم المتوسط
projectSchema.methods.calculateAverageRating = function () {
    if (this.ratings.length === 0) {
        this.averageRating = 0;
        this.totalRatings = 0;
        return;
    }
    const sum = this.ratings.reduce((acc, rating) => acc + rating.value, 0);
    this.averageRating = parseFloat((sum / this.ratings.length).toFixed(1));
    this.totalRatings = this.ratings.length;
};

// زيادة عدد المشاهدات
projectSchema.methods.incrementViews = function () {
    this.views += 1;
    this.lastViewed = Date.now();
    return this.save();
};

module.exports =
    mongoose.models.Project || mongoose.model("Project", projectSchema);
