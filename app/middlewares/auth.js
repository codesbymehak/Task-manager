const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../utils/constants');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        const error = new Error('Not authorized to access this route');
        error.statusCode = 401;
        return next(error);
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            const error = new Error('The user belonging to this token no longer does exist.');
            error.statusCode = 401;
            return next(error);
        }
        req.user = user;
        next();

    } catch (err) {
        const error = new Error('Not authorized to access this route');
        error.statusCode = 401;
        return next(error);
    }
};

module.exports = protect;
