const pdfService = require('../services/pdf.service');
const Invoice = require('../models/invoice.model');
const GroceryOrder = require('../models/grocery-order.model');

// Generate invoice PDF
exports.generateInvoicePDF = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('user', 'name roomNumber');

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

        const fileName = await pdfService.generateInvoicePDF(invoice);

        // Update invoice with PDF URL
        invoice.pdfUrl = `/pdf/${fileName}`;
        await invoice.save();

        res.json({
            success: true,
            data: {
                pdfUrl: invoice.pdfUrl
            }
        });
    } catch (error) {
        console.error('Generate invoice PDF error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating invoice PDF'
        });
    }
};

// Generate order receipt
exports.generateOrderReceipt = async (req, res) => {
    try {
        const order = await GroceryOrder.findById(req.params.id)
            .populate('user', 'name roomNumber')
            .populate('items.item', 'name');

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

        const fileName = await pdfService.generateOrderReceipt(order);

        res.json({
            success: true,
            data: {
                pdfUrl: `/pdf/${fileName}`
            }
        });
    } catch (error) {
        console.error('Generate order receipt error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating order receipt'
        });
    }
};

// Generate monthly report
exports.generateMonthlyReport = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Month and year are required'
            });
        }

        const fileName = await pdfService.generateMonthlyReport(
            parseInt(month),
            parseInt(year)
        );

        res.json({
            success: true,
            data: {
                pdfUrl: `/pdf/${fileName}`
            }
        });
    } catch (error) {
        console.error('Generate monthly report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating monthly report'
        });
    }
};

// Get PDF file
exports.getPDF = async (req, res) => {
    try {
        const filePath = await pdfService.getPDFFile(req.params.fileName);
        res.sendFile(filePath);
    } catch (error) {
        console.error('Get PDF error:', error);
        res.status(404).json({
            success: false,
            message: 'PDF file not found'
        });
    }
};
