const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const { register, login, getCurrentUser, updatePushToken } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - name
 *       properties:
 *         username:
 *           type: string
 *           description: Auto-generated username
 *         name:
 *           type: string
 *           description: User's full name
 *         type:
 *           type: string
 *           enum: [resident, admin]
 *           description: User type
 *         roomNumber:
 *           type: string
 *           description: Room number (required for residents)
 *         contactNumber:
 *           type: string
 *           description: Contact phone number
 *         days:
 *           type: number
 *           description: Number of days of stay (for residents)
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - roomNumber
 *               - days
 *               - contactNumber
 *             properties:
 *               name:
 *                 type: string
 *               roomNumber:
 *                 type: string
 *               days:
 *                 type: number
 *               contactNumber:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [resident, admin]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input data
 */
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('roomNumber', 'Room number is required').not().isEmpty(),
        check('days', 'Number of days is required').isNumeric(),
        check('contactNumber', 'Contact number is required').not().isEmpty(),
    ],
    register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
    '/login',
    [
        check('username', 'Username is required').not().isEmpty(),
        check('password', 'Password is required').not().isEmpty(),
    ],
    login
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Not authorized
 */
router.get('/me', protect, getCurrentUser);

/**
 * @swagger
 * /api/auth/push-token:
 *   put:
 *     summary: Update user's push notification token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pushToken
 *             properties:
 *               pushToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Push token updated successfully
 *       401:
 *         description: Not authorized
 */
router.put('/push-token', protect, updatePushToken);

module.exports = router;
