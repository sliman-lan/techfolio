const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
    {
        follower: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        following: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["active", "blocked"],
            default: "active",
        },
    },
    {
        timestamps: true,
    },
);

// منع التكرار (فريد)
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Compound index for queries
followSchema.index({ follower: 1, createdAt: -1 });
followSchema.index({ following: 1, createdAt: -1 });

// بعد الحفظ، تحديث counters في User
followSchema.post("save", async function (doc) {
    try {
        const User = mongoose.model("User");

        // تحديث عدد المتابعين للمستخدم المُتابَع
        await User.findByIdAndUpdate(doc.following, {
            $inc: { followersCount: 1 },
        });

        // تحديث عدد المتابعات للمستخدم المُتابِع
        await User.findByIdAndUpdate(doc.follower, {
            $inc: { followingCount: 1 },
        });
    } catch (error) {
        console.error("Error updating follow counts:", error);
    }
});

// قبل الحذف، تحديث counters
followSchema.pre("remove", async function (next) {
    try {
        const User = mongoose.model("User");

        // تقليل عدد المتابعين للمستخدم المُتابَع
        await User.findByIdAndUpdate(this.following, {
            $inc: { followersCount: -1 },
        });

        // تقليل عدد المتابعات للمستخدم المُتابِع
        await User.findByIdAndUpdate(this.follower, {
            $inc: { followingCount: -1 },
        });
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model("Follow", followSchema);
