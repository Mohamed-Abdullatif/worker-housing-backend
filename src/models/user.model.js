const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['resident', 'admin'],
        default: 'resident',
    },
    roomNumber: {
        type: String,
        required: function () { return this.type === 'resident'; },
    },
    contactNumber: {
        type: String,
        required: function () { return this.type === 'resident'; },
    },
    days: {
        type: Number,
        required: function () { return this.type === 'resident'; },
        min: 1,
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    pushToken: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate username
userSchema.statics.generateUsername = function (name, roomNumber) {
    return `${name.toLowerCase().replace(/\s+/g, '')}${roomNumber}`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
