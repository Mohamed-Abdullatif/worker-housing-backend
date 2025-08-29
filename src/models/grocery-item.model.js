const mongoose = require('mongoose');

const groceryItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    nameAr: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['food', 'beverages', 'cleaning', 'other']
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        required: true,
        enum: ['piece', 'kg', 'liter', 'pack']
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    image: {
        type: String
    },
    description: {
        type: String,
        trim: true
    },
    descriptionAr: {
        type: String,
        trim: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
groceryItemSchema.index({ category: 1, isAvailable: 1 });
groceryItemSchema.index({ name: 1 });
groceryItemSchema.index({ nameAr: 1 });

const GroceryItem = mongoose.model('GroceryItem', groceryItemSchema);

module.exports = GroceryItem;
