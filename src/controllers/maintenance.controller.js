const { validationResult } = require('express-validator');
const Maintenance = require('../models/maintenance.model');
const User = require('../models/user.model');

// Create maintenance request
exports.createRequest = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { type, description, priority, images } = req.body;
        const user = req.user;

        const maintenanceRequest = new Maintenance({
            user: user._id,
            roomNumber: user.roomNumber,
            type,
            description,
            priority,
            images,
            notes: [{
                user: user._id,
                content: `Maintenance request created for ${type}`
            }]
        });

        await maintenanceRequest.save();

        // Populate user data
        await maintenanceRequest.populate('user', 'name roomNumber');

        res.status(201).json({
            success: true,
            data: maintenanceRequest
        });
    } catch (error) {
        console.error('Create maintenance request error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating maintenance request'
        });
    }
};

// Get all maintenance requests
exports.getRequests = async (req, res) => {
    try {
        const { status, roomNumber, type } = req.query;
        const query = {};

        // Filter by status if provided
        if (status) query.status = status;

        // Filter by room number if provided
        if (roomNumber) query.roomNumber = roomNumber;

        // Filter by type if provided
        if (type) query.type = type;

        // If user is resident, only show their requests
        if (req.user.type === 'resident') {
            query.user = req.user._id;
        }

        const maintenanceRequests = await Maintenance.find(query)
            .populate('user', 'name roomNumber')
            .populate('assignedTo', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: maintenanceRequests.length,
            data: maintenanceRequests
        });
    } catch (error) {
        console.error('Get maintenance requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching maintenance requests'
        });
    }
};

// Get single maintenance request
exports.getRequest = async (req, res) => {
    try {
        const maintenanceRequest = await Maintenance.findById(req.params.id)
            .populate('user', 'name roomNumber')
            .populate('assignedTo', 'name')
            .populate('notes.user', 'name');

        if (!maintenanceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance request not found'
            });
        }

        // Check if user has access to this request
        if (req.user.type === 'resident' && maintenanceRequest.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this maintenance request'
            });
        }

        res.json({
            success: true,
            data: maintenanceRequest
        });
    } catch (error) {
        console.error('Get maintenance request error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching maintenance request'
        });
    }
};

// Update maintenance request status
exports.updateStatus = async (req, res) => {
    try {
        const { status, note } = req.body;

        const maintenanceRequest = await Maintenance.findById(req.params.id);

        if (!maintenanceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance request not found'
            });
        }

        // Only admin can update status
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update maintenance request status'
            });
        }

        maintenanceRequest.status = status;
        if (status === 'completed') {
            maintenanceRequest.completedAt = Date.now();
        }

        // Add note if provided
        if (note) {
            maintenanceRequest.notes.push({
                user: req.user._id,
                content: note
            });
        }

        await maintenanceRequest.save();
        await maintenanceRequest.populate('user', 'name roomNumber');
        await maintenanceRequest.populate('assignedTo', 'name');
        await maintenanceRequest.populate('notes.user', 'name');

        res.json({
            success: true,
            data: maintenanceRequest
        });
    } catch (error) {
        console.error('Update maintenance status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating maintenance request status'
        });
    }
};

// Assign maintenance request
exports.assignRequest = async (req, res) => {
    try {
        const { assignedTo } = req.body;

        const maintenanceRequest = await Maintenance.findById(req.params.id);

        if (!maintenanceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance request not found'
            });
        }

        // Only admin can assign requests
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to assign maintenance requests'
            });
        }

        // Verify assigned user exists and is admin
        const assignedUser = await User.findById(assignedTo);
        if (!assignedUser || assignedUser.type !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Invalid assigned user'
            });
        }

        maintenanceRequest.assignedTo = assignedTo;
        maintenanceRequest.notes.push({
            user: req.user._id,
            content: `Request assigned to ${assignedUser.name}`
        });

        await maintenanceRequest.save();
        await maintenanceRequest.populate('user', 'name roomNumber');
        await maintenanceRequest.populate('assignedTo', 'name');
        await maintenanceRequest.populate('notes.user', 'name');

        res.json({
            success: true,
            data: maintenanceRequest
        });
    } catch (error) {
        console.error('Assign maintenance request error:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning maintenance request'
        });
    }
};

// Add note to maintenance request
exports.addNote = async (req, res) => {
    try {
        const { content } = req.body;

        const maintenanceRequest = await Maintenance.findById(req.params.id);

        if (!maintenanceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance request not found'
            });
        }

        // Check if user has access to this request
        if (req.user.type === 'resident' && maintenanceRequest.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add notes to this maintenance request'
            });
        }

        maintenanceRequest.notes.push({
            user: req.user._id,
            content
        });

        await maintenanceRequest.save();
        await maintenanceRequest.populate('user', 'name roomNumber');
        await maintenanceRequest.populate('assignedTo', 'name');
        await maintenanceRequest.populate('notes.user', 'name');

        res.json({
            success: true,
            data: maintenanceRequest
        });
    } catch (error) {
        console.error('Add maintenance note error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding note to maintenance request'
        });
    }
};
