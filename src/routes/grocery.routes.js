const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const {
    createItem,
    getItems,
    getItem,
    updateItem,
    deleteItem,
    updateStock,
    toggleAvailability
} = require('../controllers/grocery-item.controller');

const {
    createOrder,
    getOrders,
    getOrder,
    updateStatus,
    updatePaymentStatus
} = require('../controllers/grocery-order.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     GroceryItem:
 *       type: object
 *       required:
 *         - name
 *         - nameAr
 *         - category
 *         - price
 *         - unit
 *       properties:
 *         name:
 *           type: string
 *         nameAr:
 *           type: string
 *         category:
 *           type: string
 *           enum: [food, beverages, cleaning, other]
 *         price:
 *           type: number
 *         unit:
 *           type: string
 *           enum: [piece, kg, liter, pack]
 *         stock:
 *           type: number
 *         image:
 *           type: string
 *         description:
 *           type: string
 *         descriptionAr:
 *           type: string
 *         isAvailable:
 *           type: boolean
 */

// Grocery Item Routes

/**
 * @swagger
 * /api/grocery/items:
 *   post:
 *     summary: Create a new grocery item
 *     tags: [Grocery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroceryItem'
 *     responses:
 *       201:
 *         description: Grocery item created successfully
 */
router.post(
    '/items',
    protect,
    authorize('admin'),
    [
        check('name', 'Name is required').not().isEmpty(),
        check('nameAr', 'Arabic name is required').not().isEmpty(),
        check('category', 'Category is required').isIn(['food', 'beverages', 'cleaning', 'other']),
        check('price', 'Price is required').isNumeric(),
        check('unit', 'Unit is required').isIn(['piece', 'kg', 'liter', 'pack']),
        check('stock', 'Stock must be a number').optional().isNumeric(),
    ],
    createItem
);

/**
 * @swagger
 * /api/grocery/items:
 *   get:
 *     summary: Get all grocery items
 *     tags: [Grocery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [food, beverages, cleaning, other]
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of grocery items
 */
router.get('/items', protect, getItems);

/**
 * @swagger
 * /api/grocery/items/{id}:
 *   get:
 *     summary: Get a single grocery item
 *     tags: [Grocery]
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
 *         description: Grocery item details
 */
router.get('/items/:id', protect, getItem);

/**
 * @swagger
 * /api/grocery/items/{id}:
 *   put:
 *     summary: Update a grocery item
 *     tags: [Grocery]
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
 *             $ref: '#/components/schemas/GroceryItem'
 *     responses:
 *       200:
 *         description: Grocery item updated successfully
 */
router.put('/items/:id', protect, authorize('admin'), updateItem);

/**
 * @swagger
 * /api/grocery/items/{id}:
 *   delete:
 *     summary: Delete a grocery item
 *     tags: [Grocery]
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
 *         description: Grocery item deleted successfully
 */
router.delete('/items/:id', protect, authorize('admin'), deleteItem);

/**
 * @swagger
 * /api/grocery/items/{id}/stock:
 *   put:
 *     summary: Update grocery item stock
 *     tags: [Grocery]
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
 *               - stock
 *             properties:
 *               stock:
 *                 type: number
 *     responses:
 *       200:
 *         description: Stock updated successfully
 */
router.put(
    '/items/:id/stock',
    protect,
    authorize('admin'),
    [
        check('stock', 'Stock must be a number').isNumeric(),
    ],
    updateStock
);

/**
 * @swagger
 * /api/grocery/items/{id}/availability:
 *   put:
 *     summary: Toggle grocery item availability
 *     tags: [Grocery]
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
 *         description: Availability toggled successfully
 */
router.put('/items/:id/availability', protect, authorize('admin'), toggleAvailability);

// Order Routes

/**
 * @swagger
 * /api/grocery/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Grocery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - paymentMethod
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     item:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, room_charge]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 */
router.post(
    '/orders',
    protect,
    [
        check('items', 'Items are required').isArray(),
        check('items.*.item', 'Item ID is required').not().isEmpty(),
        check('items.*.quantity', 'Quantity must be a number').isNumeric(),
        check('paymentMethod', 'Payment method is required').isIn(['cash', 'room_charge']),
    ],
    createOrder
);

/**
 * @swagger
 * /api/grocery/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Grocery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, ready, delivered, cancelled]
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
 *         description: List of orders
 */
router.get('/orders', protect, getOrders);

/**
 * @swagger
 * /api/grocery/orders/{id}:
 *   get:
 *     summary: Get a single order
 *     tags: [Grocery]
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
 *         description: Order details
 */
router.get('/orders/:id', protect, getOrder);

/**
 * @swagger
 * /api/grocery/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Grocery]
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
 *                 enum: [processing, ready, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.put(
    '/orders/:id/status',
    protect,
    authorize('admin'),
    [
        check('status', 'Status is required').isIn(['processing', 'ready', 'delivered', 'cancelled']),
    ],
    updateStatus
);

/**
 * @swagger
 * /api/grocery/orders/{id}/payment:
 *   put:
 *     summary: Update order payment status
 *     tags: [Grocery]
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
 *               - paymentStatus
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, paid]
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 */
router.put(
    '/orders/:id/payment',
    protect,
    authorize('admin'),
    [
        check('paymentStatus', 'Payment status is required').isIn(['pending', 'paid']),
    ],
    updatePaymentStatus
);

module.exports = router;
