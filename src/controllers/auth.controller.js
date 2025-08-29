const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, type: user.type },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Register new user
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, roomNumber, days, contactNumber, type = 'resident' } = req.body;

        // Generate username
        const username = User.generateUsername(name, roomNumber);
        const password = 'password123'; // Default password

        // Check if user already exists
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists',
            });
        }

        // Create new user
        user = new User({
            username,
            password,
            name,
            type,
            roomNumber,
            days,
            contactNumber,
        });

        await user.save();

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username,
                    name,
                    type,
                    roomNumber,
                    contactNumber,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error in user registration',
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check if user is active
        if (!user.active) {
            return res.status(401).json({
                success: false,
                message: 'User account is inactive',
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Generate token
        const token = generateToken(user);

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    name: user.name,
                    type: user.type,
                    roomNumber: user.roomNumber,
                    contactNumber: user.contactNumber,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error in user login',
        });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data',
        });
    }
};

// Update push token
exports.updatePushToken = async (req, res) => {
    try {
        const { pushToken } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { pushToken },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Update push token error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating push token',
        });
    }
};
