const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    sendTestNotification
} = require('../controllers/notification.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         titleAr:
 *           type: string
 *         body:
 *           type: string
 *         bodyAr:
 *           type: string
 *         type:
 *           type: string
 *           enum: [maintenance, invoice, grocery, system]
 *         isRead:
 *           type: boolean
 *         data:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [maintenance, invoice, grocery, system]
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', protect, getNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.put('/:id/read', protect, markAsRead);

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.put('/read-all', protect, markAllAsRead);

/**
 * @swagger
 * /api/notifications/test:
 *   post:
 *     summary: Send test notification (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - titleAr
 *               - body
 *               - bodyAr
 *               - type
 *             properties:
 *               userId:
 *                 type: string
 *               title:
 *                 type: string
 *               titleAr:
 *                 type: string
 *               body:
 *                 type: string
 *               bodyAr:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [maintenance, invoice, grocery, system]
 *     responses:
 *       200:
 *         description: Test notification sent successfully
 */
router.post(
    '/test',
    protect,
    authorize('admin'),
    [
        check('userId', 'User ID is required').not().isEmpty(),
        check('title', 'Title is required').not().isEmpty(),
        check('titleAr', 'Arabic title is required').not().isEmpty(),
        check('body', 'Body is required').not().isEmpty(),
        check('bodyAr', 'Arabic body is required').not().isEmpty(),
        check('type', 'Type is required').isIn(['maintenance', 'invoice', 'grocery', 'system']),
    ],
    sendTestNotification
);

module.exports = router;
