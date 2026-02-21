const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
        type: String,
        enum: ["student", "teacher", "admin"], // الأدوار الجديدة
        default: "student",
    },
    avatar: { type: String, default: "default-avatar.png" },
    bio: { type: String, maxlength: 500 },
    skills: [{ type: String, trim: true }],
    certifications: [
        {
            title: String,
            issuer: String,
            date: Date,
            credentialId: String,
        },
    ],
    socialLinks: {
        github: String,
        linkedin: String,
        portfolio: String,
    },
    isProfilePublic: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

// تشفير كلمة المرور قبل الحفظ
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// مقارنة كلمة المرور
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
