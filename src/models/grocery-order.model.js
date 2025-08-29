const mongoose = require('mongoose');

const groceryOrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomNumber: {
        type: String,
        required: true
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    items: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GroceryItem',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'ready', 'delivered', 'cancelled'],
        default: 'pending'
    },
    notes: {
        type: String,
        trim: true
    },
    deliveryTime: {
        type: Date
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'room_charge'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Index for faster queries
groceryOrderSchema.index({ user: 1, status: 1 });
groceryOrderSchema.index({ roomNumber: 1, status: 1 });
groceryOrderSchema.index({ orderNumber: 1 });
groceryOrderSchema.index({ status: 1, createdAt: -1 });

// Generate order number
groceryOrderSchema.pre('save', async function (next) {
    if (this.isNew) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        // Get count of orders for current day
        const count = await mongoose.model('GroceryOrder').countDocuments({
            createdAt: {
                $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
            }
        });

        // Generate order number: ORD-YYYYMMDD-XXX
        this.orderNumber = `ORD-${year}${month}${day}-${String(count + 1).padStart(3, '0')}`;
    }
    next();
});

// Update stock after order status change
groceryOrderSchema.pre('save', async function (next) {
    if (this.isModified('status')) {
        const GroceryItem = mongoose.model('GroceryItem');

        // If order is cancelled and was previously processing/ready, return items to stock
        if (this.status === 'cancelled' && ['processing', 'ready'].includes(this._original?.status)) {
            for (const orderItem of this.items) {
                await GroceryItem.findByIdAndUpdate(orderItem.item, {
                    $inc: { stock: orderItem.quantity }
                });
            }
        }

        // If order is processing and was previously pending, reduce stock
        if (this.status === 'processing' && this._original?.status === 'pending') {
            for (const orderItem of this.items) {
                const item = await GroceryItem.findById(orderItem.item);
                if (item.stock < orderItem.quantity) {
                    throw new Error(`Insufficient stock for item: ${item.name}`);
                }
                item.stock -= orderItem.quantity;
                await item.save();
            }
        }
    }
    next();
});

// Save original status before update
groceryOrderSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this._original = this.toObject();
    }
    next();
});

const GroceryOrder = mongoose.model('GroceryOrder', groceryOrderSchema);

module.exports = GroceryOrder;
