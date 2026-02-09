const createSuccessResponse = (message, data = null, statusCode = 200) => {
    return {
        statusCode,
        message,
        data
    };
};

const createErrorResponse = (message, statusCode = 500) => {
    return {
        statusCode,
        message,
        data: null
    };
};

module.exports = {
    createSuccessResponse,
    createErrorResponse
};
