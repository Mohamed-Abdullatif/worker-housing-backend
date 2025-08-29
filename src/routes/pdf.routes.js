const express = require('express');
const router = express.Router();
const {
    generateInvoicePDF,
    generateOrderReceipt,
    generateMonthlyReport,
    getPDF
} = require('../controllers/pdf.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/pdf/invoice/{id}:
 *   post:
 *     summary: Generate invoice PDF
 *     tags: [PDF]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     pdfUrl:
 *                       type: string
 */
router.post('/invoice/:id', protect, generateInvoicePDF);

/**
 * @swagger
 * /api/pdf/order/{id}:
 *   post:
 *     summary: Generate order receipt PDF
 *     tags: [PDF]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     pdfUrl:
 *                       type: string
 */
router.post('/order/:id', protect, generateOrderReceipt);

/**
 * @swagger
 * /api/pdf/report:
 *   get:
 *     summary: Generate monthly report PDF
 *     tags: [PDF]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month number (1-12)
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year (e.g., 2024)
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     pdfUrl:
 *                       type: string
 */
router.get('/report', protect, authorize('admin'), generateMonthlyReport);

/**
 * @swagger
 * /api/pdf/{fileName}:
 *   get:
 *     summary: Get PDF file
 *     tags: [PDF]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *         description: PDF file name
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:fileName', protect, getPDF);

module.exports = router;
