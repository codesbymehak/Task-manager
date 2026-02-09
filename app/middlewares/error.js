const { createErrorResponse } = require('../helpers');

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Server Error';

    res.status(statusCode).json(createErrorResponse(message, statusCode));
};

module.exports = errorHandler;
