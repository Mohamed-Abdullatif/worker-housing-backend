const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');
const QRCode = require('qrcode');
const Invoice = require('../models/invoice.model');
const GroceryOrder = require('../models/grocery-order.model');

class PDFService {
    constructor() {
        this.uploadsDir = path.join(__dirname, '../../uploads/pdf');
        fs.ensureDirSync(this.uploadsDir);
    }

    // Generate QR code
    async generateQRCode(data) {
        return await QRCode.toDataURL(JSON.stringify(data));
    }

    // Format currency
    formatCurrency(amount) {
        return `SAR ${amount.toFixed(2)}`;
    }

    // Format date
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Add header to PDF
    addHeader(doc, title) {
        doc
            .image(path.join(__dirname, '../../assets/logo.png'), 50, 45, { width: 50 })
            .fontSize(20)
            .text('Worker Housing System', 110, 57)
            .fontSize(10)
            .text('123 Main Street, Riyadh, Saudi Arabia', 110, 80)
            .text('Phone: +966 11 234 5678', 110, 95)
            .text('Email: info@workerhousing.com', 110, 110)
            .moveDown();

        doc
            .fontSize(16)
            .text(title, 50, 150)
            .moveDown();
    }

    // Add footer to PDF
    addFooter(doc) {
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);

            // Add page number
            doc
                .fontSize(8)
                .text(
                    `Page ${i + 1} of ${pageCount}`,
                    50,
                    doc.page.height - 50,
                    { align: 'center' }
                );
        }
    }

    // Generate invoice PDF
    async generateInvoicePDF(invoice) {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const fileName = `invoice_${invoice.invoiceNumber}.pdf`;
            const filePath = path.join(this.uploadsDir, fileName);

            // Pipe PDF to file
            doc.pipe(fs.createWriteStream(filePath));

            // Add header
            this.addHeader(doc, 'INVOICE');

            // Add invoice details
            doc
                .fontSize(10)
                .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 200)
                .text(`Date: ${this.formatDate(invoice.createdAt)}`, 50, 215)
                .text(`Due Date: ${this.formatDate(invoice.dueDate)}`, 50, 230)
                .moveDown();

            // Add customer details
            doc
                .text('Bill To:', 50, 260)
                .text(invoice.user.name, 50, 275)
                .text(`Room Number: ${invoice.roomNumber}`, 50, 290)
                .moveDown();

            // Add items table
            const tableTop = 330;
            doc
                .fontSize(10)
                .text('Description', 50, tableTop)
                .text('Quantity', 280, tableTop)
                .text('Price', 350, tableTop)
                .text('Amount', 450, tableTop);

            // Add horizontal line
            doc
                .moveTo(50, tableTop + 15)
                .lineTo(550, tableTop + 15)
                .stroke();

            // Add items
            let position = tableTop + 30;
            invoice.items.forEach(item => {
                doc
                    .text(item.description, 50, position)
                    .text(item.quantity.toString(), 280, position)
                    .text(this.formatCurrency(item.amount), 350, position)
                    .text(this.formatCurrency(item.amount * item.quantity), 450, position);
                position += 20;
            });

            // Add total
            doc
                .moveTo(50, position + 15)
                .lineTo(550, position + 15)
                .stroke()
                .fontSize(12)
                .text('Total:', 350, position + 30)
                .text(this.formatCurrency(invoice.amount), 450, position + 30);

            // Add QR code
            const qrCode = await this.generateQRCode({
                invoiceNumber: invoice.invoiceNumber,
                amount: invoice.amount,
                date: invoice.createdAt
            });
            doc.image(qrCode, 50, position + 50, { width: 100 });

            // Add footer
            this.addFooter(doc);

            // Finalize PDF
            doc.end();

            return fileName;
        } catch (error) {
            console.error('Generate invoice PDF error:', error);
            throw error;
        }
    }

    // Generate grocery order receipt
    async generateOrderReceipt(order) {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const fileName = `order_${order.orderNumber}.pdf`;
            const filePath = path.join(this.uploadsDir, fileName);

            // Pipe PDF to file
            doc.pipe(fs.createWriteStream(filePath));

            // Add header
            this.addHeader(doc, 'ORDER RECEIPT');

            // Add order details
            doc
                .fontSize(10)
                .text(`Order Number: ${order.orderNumber}`, 50, 200)
                .text(`Date: ${this.formatDate(order.createdAt)}`, 50, 215)
                .text(`Status: ${order.status}`, 50, 230)
                .moveDown();

            // Add customer details
            doc
                .text('Customer:', 50, 260)
                .text(order.user.name, 50, 275)
                .text(`Room Number: ${order.roomNumber}`, 50, 290)
                .moveDown();

            // Add items table
            const tableTop = 330;
            doc
                .fontSize(10)
                .text('Item', 50, tableTop)
                .text('Quantity', 280, tableTop)
                .text('Price', 350, tableTop)
                .text('Amount', 450, tableTop);

            // Add horizontal line
            doc
                .moveTo(50, tableTop + 15)
                .lineTo(550, tableTop + 15)
                .stroke();

            // Add items
            let position = tableTop + 30;
            order.items.forEach(item => {
                doc
                    .text(item.item.name, 50, position)
                    .text(item.quantity.toString(), 280, position)
                    .text(this.formatCurrency(item.price), 350, position)
                    .text(this.formatCurrency(item.price * item.quantity), 450, position);
                position += 20;
            });

            // Add total
            doc
                .moveTo(50, position + 15)
                .lineTo(550, position + 15)
                .stroke()
                .fontSize(12)
                .text('Total:', 350, position + 30)
                .text(this.formatCurrency(order.totalAmount), 450, position + 30);

            // Add payment details
            doc
                .moveDown()
                .fontSize(10)
                .text(`Payment Method: ${order.paymentMethod}`, 50, position + 60)
                .text(`Payment Status: ${order.paymentStatus}`, 50, position + 75);

            // Add QR code
            const qrCode = await this.generateQRCode({
                orderNumber: order.orderNumber,
                amount: order.totalAmount,
                date: order.createdAt
            });
            doc.image(qrCode, 50, position + 100, { width: 100 });

            // Add footer
            this.addFooter(doc);

            // Finalize PDF
            doc.end();

            return fileName;
        } catch (error) {
            console.error('Generate order receipt error:', error);
            throw error;
        }
    }

    // Generate monthly report
    async generateMonthlyReport(month, year) {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const fileName = `report_${year}_${month}.pdf`;
            const filePath = path.join(this.uploadsDir, fileName);

            // Pipe PDF to file
            doc.pipe(fs.createWriteStream(filePath));

            // Add header
            this.addHeader(doc, 'MONTHLY REPORT');

            // Add report details
            const date = new Date(year, month - 1);
            doc
                .fontSize(10)
                .text(`Report Period: ${date.toLocaleString('en-SA', { month: 'long', year: 'numeric' })}`, 50, 200)
                .text(`Generated on: ${this.formatDate(new Date())}`, 50, 215)
                .moveDown();

            // Get monthly data
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            const invoices = await Invoice.find({
                createdAt: { $gte: startDate, $lte: endDate }
            });

            const orders = await GroceryOrder.find({
                createdAt: { $gte: startDate, $lte: endDate }
            });

            // Add invoice summary
            doc
                .fontSize(12)
                .text('Invoice Summary', 50, 250)
                .moveDown()
                .fontSize(10);

            const totalInvoices = invoices.length;
            const paidInvoices = invoices.filter(i => i.status === 'paid').length;
            const totalInvoiceAmount = invoices.reduce((sum, i) => sum + i.amount, 0);
            const paidInvoiceAmount = invoices
                .filter(i => i.status === 'paid')
                .reduce((sum, i) => sum + i.amount, 0);

            doc
                .text(`Total Invoices: ${totalInvoices}`, 70, 280)
                .text(`Paid Invoices: ${paidInvoices}`, 70, 295)
                .text(`Total Amount: ${this.formatCurrency(totalInvoiceAmount)}`, 70, 310)
                .text(`Paid Amount: ${this.formatCurrency(paidInvoiceAmount)}`, 70, 325)
                .moveDown();

            // Add order summary
            doc
                .fontSize(12)
                .text('Order Summary', 50, 370)
                .moveDown()
                .fontSize(10);

            const totalOrders = orders.length;
            const completedOrders = orders.filter(o => o.status === 'delivered').length;
            const totalOrderAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

            doc
                .text(`Total Orders: ${totalOrders}`, 70, 400)
                .text(`Completed Orders: ${completedOrders}`, 70, 415)
                .text(`Total Amount: ${this.formatCurrency(totalOrderAmount)}`, 70, 430)
                .moveDown();

            // Add charts (placeholder for future implementation)
            doc
                .fontSize(12)
                .text('Monthly Trends', 50, 480)
                .fontSize(10)
                .text('(Charts to be implemented)', 70, 500);

            // Add footer
            this.addFooter(doc);

            // Finalize PDF
            doc.end();

            return fileName;
        } catch (error) {
            console.error('Generate monthly report error:', error);
            throw error;
        }
    }

    // Get PDF file
    async getPDFFile(fileName) {
        const filePath = path.join(this.uploadsDir, fileName);
        if (!await fs.pathExists(filePath)) {
            throw new Error('PDF file not found');
        }
        return filePath;
    }

    // Delete PDF file
    async deletePDFFile(fileName) {
        const filePath = path.join(this.uploadsDir, fileName);
        if (await fs.pathExists(filePath)) {
            await fs.remove(filePath);
        }
    }
}

module.exports = new PDFService();
