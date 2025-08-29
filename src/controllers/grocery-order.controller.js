const { validationResult } = require('express-validator');
const GroceryOrder = require('../models/grocery-order.model');
const GroceryItem = require('../models/grocery-item.model');

// Create order
exports.createOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { items, paymentMethod, notes } = req.body;
        const user = req.user;

        // Validate items and calculate total
        let totalAmount = 0;
        const orderItems = [];

        for (const orderItem of items) {
            const item = await GroceryItem.findById(orderItem.item);
            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: `Item not found: ${orderItem.item}`
                });
            }

            if (!item.isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: `Item is not available: ${item.name}`
                });
            }

            if (item.stock < orderItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for item: ${item.name}`
                });
            }

            orderItems.push({
                item: item._id,
                quantity: orderItem.quantity,
                price: item.price
            });

            totalAmount += item.price * orderItem.quantity;
        }

        const order = new GroceryOrder({
            user: user._id,
            roomNumber: user.roomNumber,
            items: orderItems,
            totalAmount,
            paymentMethod,
            notes
        });

        await order.save();
        await order.populate('items.item');
        await order.populate('user', 'name roomNumber');

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order'
        });
    }
};

// Get all orders
exports.getOrders = async (req, res) => {
    try {
        const { status, roomNumber, startDate, endDate } = req.query;
        const query = {};

        if (status) query.status = status;
        if (roomNumber) query.roomNumber = roomNumber;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // If user is resident, only show their orders
        if (req.user.type === 'resident') {
            query.user = req.user._id;
        }

        const orders = await GroceryOrder.find(query)
            .populate('items.item')
            .populate('user', 'name roomNumber')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
};

// Get single order
exports.getOrder = async (req, res) => {
    try {
        const order = await GroceryOrder.findById(req.params.id)
            .populate('items.item')
            .populate('user', 'name roomNumber');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user has access to this order
        if (req.user.type === 'resident' && order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this order'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order'
        });
    }
};

// Update order status
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await GroceryOrder.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Only admin can update status
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update order status'
            });
        }

        // Validate status transition
        const validTransitions = {
            pending: ['processing', 'cancelled'],
            processing: ['ready', 'cancelled'],
            ready: ['delivered', 'cancelled'],
            delivered: [],
            cancelled: []
        };

        if (!validTransitions[order.status].includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from ${order.status} to ${status}`
            });
        }

        order.status = status;
        if (status === 'delivered') {
            order.deliveryTime = new Date();
        }

        await order.save();
        await order.populate('items.item');
        await order.populate('user', 'name roomNumber');

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status'
        });
    }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus } = req.body;

        const order = await GroceryOrder.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Only admin can update payment status
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update payment status'
            });
        }

        order.paymentStatus = paymentStatus;
        await order.save();
        await order.populate('items.item');
        await order.populate('user', 'name roomNumber');

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating payment status'
        });
    }
};
