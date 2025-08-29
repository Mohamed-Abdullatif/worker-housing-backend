const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const {
    createRequest,
    getRequests,
    getRequest,
    updateStatus,
    assignRequest,
    addNote
} = require('../controllers/maintenance.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     MaintenanceRequest:
 *       type: object
 *       required:
 *         - type
 *         - description
 *       properties:
 *         type:
 *           type: string
 *           enum: [plumbing, electrical, furniture, appliance, other]
 *         description:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         images:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/maintenance:
 *   post:
 *     summary: Create a new maintenance request
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - description
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [plumbing, electrical, furniture, appliance, other]
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Maintenance request created successfully
 */
router.post(
    '/',
    protect,
    [
        check('type', 'Type is required').isIn(['plumbing', 'electrical', 'furniture', 'appliance', 'other']),
        check('description', 'Description is required').not().isEmpty(),
        check('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    ],
    createRequest
);

/**
 * @swagger
 * /api/maintenance:
 *   get:
 *     summary: Get all maintenance requests
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *       - in: query
 *         name: roomNumber
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [plumbing, electrical, furniture, appliance, other]
 *     responses:
 *       200:
 *         description: List of maintenance requests
 */
router.get('/', protect, getRequests);

/**
 * @swagger
 * /api/maintenance/{id}:
 *   get:
 *     summary: Get a single maintenance request
 *     tags: [Maintenance]
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
 *         description: Maintenance request details
 */
router.get('/:id', protect, getRequest);

/**
 * @swagger
 * /api/maintenance/{id}/status:
 *   put:
 *     summary: Update maintenance request status
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.put(
    '/:id/status',
    protect,
    authorize('admin'),
    [
        check('status', 'Status is required').isIn(['pending', 'in_progress', 'completed', 'cancelled']),
    ],
    updateStatus
);

/**
 * @swagger
 * /api/maintenance/{id}/assign:
 *   put:
 *     summary: Assign maintenance request to admin
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignedTo
 *             properties:
 *               assignedTo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request assigned successfully
 */
router.put(
    '/:id/assign',
    protect,
    authorize('admin'),
    [
        check('assignedTo', 'Assigned user ID is required').not().isEmpty(),
    ],
    assignRequest
);

/**
 * @swagger
 * /api/maintenance/{id}/notes:
 *   post:
 *     summary: Add a note to maintenance request
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note added successfully
 */
router.post(
    '/:id/notes',
    protect,
    [
        check('content', 'Note content is required').not().isEmpty(),
    ],
    addNote
);

module.exports = router;
