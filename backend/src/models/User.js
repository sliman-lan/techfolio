const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 6 },
        role: {
            type: String,
            enum: ["student", "teacher", "admin"],
            default: "student",
        },
        avatar: { type: String, default: "default-avatar.png" },
        bio: { type: String, maxlength: 500, default: "" },
        skills: [{ type: String, trim: true }],
        certifications: [
            {
                title: { type: String, required: true },
                issuer: { type: String, required: true },
                date: { type: Date, default: Date.now },
                credentialId: { type: String },
                credentialUrl: { type: String },
            },
        ],
        socialLinks: {
            github: { type: String, default: "" },
            linkedin: { type: String, default: "" },
            twitter: { type: String, default: "" },
            portfolio: { type: String, default: "" },
        },
        isProfilePublic: { type: Boolean, default: true },
        followersCount: { type: Number, default: 0 },
        followingCount: { type: Number, default: 0 },
        projectsCount: { type: Number, default: 0 },
        lastActive: { type: Date, default: Date.now },
        accountStatus: {
            type: String,
            enum: ["active", "suspended", "deleted"],
            default: "active",
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Virtual populate for followers and following
userSchema.virtual("followers", {
    ref: "Follow",
    localField: "_id",
    foreignField: "following",
    count: true,
});

userSchema.virtual("following", {
    ref: "Follow",
    localField: "_id",
    foreignField: "follower",
    count: true,
});

// Virtual for projects
userSchema.virtual("projects", {
    ref: "Project",
    localField: "_id",
    foreignField: "userId",
    count: true,
});

// تشفير كلمة المرور قبل الحفظ - تم التعديل هنا
userSchema.pre("save", async function () {
    // إزالة next وإضافة return
    if (!this.isModified("password")) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error; // إعادة رمي الخطأ ليتعامل معه Mongoose
    }
});

// مقارنة كلمة المرور
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// تحديث آخر نشاط
userSchema.methods.updateLastActive = function () {
    this.lastActive = Date.now();
    return this.save();
};

module.exports = mongoose.model("User", userSchema);
