const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: [
                "rating",
                "comment",
                "like",
                "follow",
                "project_approved",
                "project_rejected",
                "mention",
                "reply",
            ],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "relatedModel",
        },
        relatedModel: {
            type: String,
            enum: ["Project", "Comment", "User"],
            required: true,
        },
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        isRead: { type: Boolean, default: false },
        isClicked: { type: Boolean, default: false },
        image: { type: String },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

// Mark as read
notificationSchema.methods.markAsRead = function () {
    this.isRead = true;
    return this.save();
};

// Mark as clicked
notificationSchema.methods.markAsClicked = function () {
    this.isClicked = true;
    return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function (data) {
    return this.create(data);
};

module.exports = mongoose.model("Notification", notificationSchema);
