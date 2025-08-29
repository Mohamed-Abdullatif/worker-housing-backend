const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const {
    createInvoice,
    getInvoices,
    getInvoice,
    updateStatus,
    addNote,
    getOverdueInvoices,
    updatePdfUrl
} = require('../controllers/invoice.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       required:
 *         - userId
 *         - items
 *         - dueDate
 *       properties:
 *         userId:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               quantity:
 *                 type: number
 *         dueDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [pending, paid, overdue, cancelled]
 */

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invoice'
 *     responses:
 *       201:
 *         description: Invoice created successfully
 */
router.post(
    '/',
    protect,
    authorize('admin'),
    [
        check('userId', 'User ID is required').not().isEmpty(),
        check('items', 'Items are required').isArray(),
        check('items.*.description', 'Item description is required').not().isEmpty(),
        check('items.*.amount', 'Item amount is required').isNumeric(),
        check('items.*.quantity', 'Item quantity is required').isNumeric(),
        check('dueDate', 'Due date is required').isISO8601(),
    ],
    createInvoice
);

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, overdue, cancelled]
 *       - in: query
 *         name: roomNumber
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of invoices
 */
router.get('/', protect, getInvoices);

/**
 * @swagger
 * /api/invoices/overdue:
 *   get:
 *     summary: Get all overdue invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of overdue invoices
 */
router.get('/overdue', protect, getOverdueInvoices);

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get a single invoice
 *     tags: [Invoices]
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
 *         description: Invoice details
 */
router.get('/:id', protect, getInvoice);

/**
 * @swagger
 * /api/invoices/{id}/status:
 *   put:
 *     summary: Update invoice status
 *     tags: [Invoices]
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
 *                 enum: [pending, paid, overdue, cancelled]
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, bank_transfer]
 *               paymentReference:
 *                 type: string
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
        check('status', 'Status is required').isIn(['pending', 'paid', 'overdue', 'cancelled']),
        check('paymentMethod').optional().isIn(['cash', 'card', 'bank_transfer']),
    ],
    updateStatus
);

/**
 * @swagger
 * /api/invoices/{id}/notes:
 *   post:
 *     summary: Add a note to invoice
 *     tags: [Invoices]
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

/**
 * @swagger
 * /api/invoices/{id}/pdf:
 *   put:
 *     summary: Update invoice PDF URL
 *     tags: [Invoices]
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
 *               - pdfUrl
 *             properties:
 *               pdfUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: PDF URL updated successfully
 */
router.put(
    '/:id/pdf',
    protect,
    authorize('admin'),
    [
        check('pdfUrl', 'PDF URL is required').not().isEmpty(),
    ],
    updatePdfUrl
);

module.exports = router;
