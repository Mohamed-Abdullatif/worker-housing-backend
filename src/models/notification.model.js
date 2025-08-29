const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    titleAr: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    bodyAr: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['maintenance', 'invoice', 'grocery', 'system'],
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    sentViaEmail: {
        type: Boolean,
        default: false
    },
    sentViaPush: {
        type: Boolean,
        default: false
    },
    error: {
        type: String
    }
}, {
    timestamps: true
});

// Index for faster queries
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;