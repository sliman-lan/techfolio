const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "عنوان المشروع مطلوب"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "وصف المشروع مطلوب"],
    },
    shortDescription: {
        type: String,
        maxlength: 150,
    },
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
    tags: [
        {
            type: String,
            trim: true,
        },
    ],
    images: [
        {
            type: String,
        },
    ],
    demoUrl: String,
    githubUrl: String,
    technologies: [
        {
            type: String,
            trim: true,
        },
    ],
    ratings: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            value: {
                type: Number,
                min: 1,
                max: 5,
            },
            comment: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    totalRatings: {
        type: Number,
        default: 0,
    },
    // Likes
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    likesCount: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// حساب التقييم المتوسط عند إضافة تقييم جديد
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

module.exports = mongoose.model("Project", projectSchema);
