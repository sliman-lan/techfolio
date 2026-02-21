const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        shortDescription: { type: String, maxlength: 150 },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        category: {
            type: String,
            enum: ["web", "mobile", "ai", "design", "other"],
            default: "web",
        },
        tags: [{ type: String, trim: true }],
        images: [{ type: String }],
        demoUrl: String,
        githubUrl: String,
        technologies: [{ type: String, trim: true }],
        ratings: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                value: { type: Number, min: 1, max: 5 },
                comment: String,
                createdAt: { type: Date, default: Date.now },
            },
        ],
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        totalRatings: { type: Number, default: 0 },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        likesCount: { type: Number, default: 0 },
        isFeatured: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        rejectionReason: { type: String },
        createdAt: { type: Date, default: Date.now },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Virtual property for isPublic (derived from status)
projectSchema.virtual("isPublic").get(function () {
    return this.status === "approved";
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

module.exports =
    mongoose.models.Project || mongoose.model("Project", projectSchema);
