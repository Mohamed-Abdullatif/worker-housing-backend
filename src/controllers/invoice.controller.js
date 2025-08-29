const { validationResult } = require('express-validator');
const Invoice = require('../models/invoice.model');
const User = require('../models/user.model');

// Create invoice
exports.createInvoice = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, items, dueDate } = req.body;

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const invoice = new Invoice({
            user: userId,
            roomNumber: user.roomNumber,
            items,
            dueDate,
            amount: items.reduce((total, item) => total + (item.amount * item.quantity), 0),
            notes: [{
                user: req.user._id,
                content: 'Invoice created'
            }]
        });

        await invoice.save();
        await invoice.populate('user', 'name roomNumber');
        await invoice.populate('notes.user', 'name');

        res.status(201).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error('Create invoice error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating invoice'
        });
    }
};

// Get all invoices
exports.getInvoices = async (req, res) => {
    try {
        const { status, roomNumber, startDate, endDate } = req.query;
        const query = {};

        // Filter by status if provided
        if (status) query.status = status;

        // Filter by room number if provided
        if (roomNumber) query.roomNumber = roomNumber;

        // Filter by date range if provided
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // If user is resident, only show their invoices
        if (req.user.type === 'resident') {
            query.user = req.user._id;
        }

        const invoices = await Invoice.find(query)
            .populate('user', 'name roomNumber')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: invoices.length,
            data: invoices
        });
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoices'
        });
    }
};

// Get single invoice
exports.getInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('user', 'name roomNumber')
            .populate('notes.user', 'name');

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Check if user has access to this invoice
        if (req.user.type === 'resident' && invoice.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this invoice'
            });
        }

        res.json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error('Get invoice error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoice'
        });
    }
};

// Update invoice status
exports.updateStatus = async (req, res) => {
    try {
        const { status, paymentMethod, paymentReference, note } = req.body;

        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Only admin can update status
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update invoice status'
            });
        }

        invoice.status = status;

        if (status === 'paid') {
            invoice.paymentMethod = paymentMethod;
            invoice.paymentReference = paymentReference;
            invoice.paymentDate = new Date();
        }

        // Add note if provided
        if (note) {
            invoice.notes.push({
                user: req.user._id,
                content: note
            });
        }

        await invoice.save();
        await invoice.populate('user', 'name roomNumber');
        await invoice.populate('notes.user', 'name');

        res.json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error('Update invoice status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating invoice status'
        });
    }
};

// Add note to invoice
exports.addNote = async (req, res) => {
    try {
        const { content } = req.body;

        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Check if user has access to this invoice
        if (req.user.type === 'resident' && invoice.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add notes to this invoice'
            });
        }

        invoice.notes.push({
            user: req.user._id,
            content
        });

        await invoice.save();
        await invoice.populate('user', 'name roomNumber');
        await invoice.populate('notes.user', 'name');

        res.json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error('Add invoice note error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding note to invoice'
        });
    }
};

// Get overdue invoices
exports.getOverdueInvoices = async (req, res) => {
    try {
        const query = {
            status: 'pending',
            dueDate: { $lt: new Date() }
        };

        // If user is resident, only show their invoices
        if (req.user.type === 'resident') {
            query.user = req.user._id;
        }

        const overdueInvoices = await Invoice.find(query)
            .populate('user', 'name roomNumber')
            .sort({ dueDate: 1 });

        res.json({
            success: true,
            count: overdueInvoices.length,
            data: overdueInvoices
        });
    } catch (error) {
        console.error('Get overdue invoices error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching overdue invoices'
        });
    }
};

// Update invoice PDF URL
exports.updatePdfUrl = async (req, res) => {
    try {
        const { pdfUrl } = req.body;

        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Only admin can update PDF URL
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update invoice PDF'
            });
        }

        invoice.pdfUrl = pdfUrl;
        await invoice.save();

        res.json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error('Update invoice PDF URL error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating invoice PDF URL'
        });
    }
};
