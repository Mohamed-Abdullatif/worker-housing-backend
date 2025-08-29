const { validationResult } = require('express-validator');
const notificationService = require('../services/notification.service');

// Get user notifications
exports.getNotifications = async (req, res) => {
    try {
        const { page, limit, type, isRead } = req.query;

        const result = await notificationService.getUserNotifications(req.user._id, {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            type,
            isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications'
        });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(
            req.params.id,
            req.user._id
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking notification as read'
        });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        await notificationService.markAllAsRead(req.user._id);

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking all notifications as read'
        });
    }
};

// Send test notification (admin only)
exports.sendTestNotification = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, title, titleAr, body, bodyAr, type } = req.body;

        const notification = await notificationService.sendNotification({
            userId,
            title,
            titleAr,
            body,
            bodyAr,
            type,
            data: { test: true }
        });

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Send test notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending test notification'
        });
    }
};
