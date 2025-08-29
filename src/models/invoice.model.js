const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomNumber: {
        type: String,
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue', 'cancelled'],
        default: 'pending'
    },
    items: [{
        description: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'bank_transfer', null],
        default: null
    },
    paymentDate: {
        type: Date
    },
    paymentReference: {
        type: String
    },
    notes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    remindersSent: [{
        type: Date
    }],
    pdfUrl: {
        type: String
    }
}, {
    timestamps: true
});

// Index for faster queries
invoiceSchema.index({ roomNumber: 1, status: 1 });
invoiceSchema.index({ user: 1, status: 1 });
invoiceSchema.index({ dueDate: 1, status: 1 });
invoiceSchema.index({ invoiceNumber: 1 });

// Generate invoice number
invoiceSchema.pre('save', async function (next) {
    if (this.isNew) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');

        // Get count of invoices for current month
        const count = await mongoose.model('Invoice').countDocuments({
            createdAt: {
                $gte: new Date(date.getFullYear(), date.getMonth(), 1),
                $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
            }
        });

        // Generate invoice number: INV-YYYYMM-XXXX
        this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Virtual for total amount
invoiceSchema.virtual('totalAmount').get(function () {
    return this.items.reduce((total, item) => total + (item.amount * item.quantity), 0);
});

// Method to check if invoice is overdue
invoiceSchema.methods.isOverdue = function () {
    return this.status === 'pending' && new Date() > this.dueDate;
};

// Method to mark invoice as paid
invoiceSchema.methods.markAsPaid = async function (paymentMethod, paymentReference) {
    this.status = 'paid';
    this.paymentMethod = paymentMethod;
    this.paymentDate = new Date();
    this.paymentReference = paymentReference;
    await this.save();
};

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
