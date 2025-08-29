const { validationResult } = require('express-validator');
const GroceryItem = require('../models/grocery-item.model');

// Create grocery item
exports.createItem = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const item = new GroceryItem(req.body);
        await item.save();

        res.status(201).json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Create grocery item error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating grocery item'
        });
    }
};

// Get all grocery items
exports.getItems = async (req, res) => {
    try {
        const { category, available } = req.query;
        const query = {};

        if (category) query.category = category;
        if (available === 'true') query.isAvailable = true;

        const items = await GroceryItem.find(query).sort({ category: 1, name: 1 });

        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Get grocery items error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching grocery items'
        });
    }
};

// Get single grocery item
exports.getItem = async (req, res) => {
    try {
        const item = await GroceryItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Grocery item not found'
            });
        }

        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Get grocery item error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching grocery item'
        });
    }
};

// Update grocery item
exports.updateItem = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const item = await GroceryItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Grocery item not found'
            });
        }

        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Update grocery item error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating grocery item'
        });
    }
};

// Delete grocery item
exports.deleteItem = async (req, res) => {
    try {
        const item = await GroceryItem.findByIdAndDelete(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Grocery item not found'
            });
        }

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Delete grocery item error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting grocery item'
        });
    }
};

// Update stock
exports.updateStock = async (req, res) => {
    try {
        const { stock } = req.body;

        const item = await GroceryItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Grocery item not found'
            });
        }

        item.stock = stock;
        await item.save();

        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating stock'
        });
    }
};

// Toggle availability
exports.toggleAvailability = async (req, res) => {
    try {
        const item = await GroceryItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Grocery item not found'
            });
        }

        item.isAvailable = !item.isAvailable;
        await item.save();

        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Toggle availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling item availability'
        });
    }
};
