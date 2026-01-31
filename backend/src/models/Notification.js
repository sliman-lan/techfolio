// backend/src/models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["rating", "comment", "like", "follow"],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("Notification", notificationSchema);
