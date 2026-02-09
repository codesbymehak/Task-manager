const User = require('../models/User');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../utils/constants');

const signToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d'
    });
};

exports.registerUser = async (userData) => {
    const { email } = userData;
    const userExists = await User.findOne({ email });

    if (userExists) {
        const error = new Error('User already exists');
        error.statusCode = 400;
        throw error;
    }

    const user = await User.create(userData);
    const token = signToken(user._id);

    return { user, token };
};

exports.loginUser = async (email, password) => {
    if (!email || !password) {
        const error = new Error('Please provide email and password');
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    const token = signToken(user._id);
    return { user, token };
};
