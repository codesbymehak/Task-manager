const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../utils/constants');

const protect = async (req, res, next) => {
    let token;

    console.log('Headers:', req.headers);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        console.log('Error: No token provided');
        const error = new Error('Not authorized to access this route');
        error.statusCode = 401;
        return next(error);
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded Token:', decoded);

        const user = await User.findById(decoded.id);

        if (!user) {
            console.log('Error: User not found for ID:', decoded.id);
            const error = new Error('The user belonging to this token no longer does exist.');
            error.statusCode = 401;
            return next(error);
        }
        req.user = user;
        next();

    } catch (err) {
        console.log('Error verifying token:', err.message);
        const error = new Error('Not authorized to access this route');
        error.statusCode = 401;
        return next(error);
    }
};

module.exports = protect;
