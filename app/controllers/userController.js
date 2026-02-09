const userService = require('../services/userService');
const { createSuccessResponse } = require('../helpers');

exports.register = async (req, res, next) => {
    try {
        const { user, token } = await userService.registerUser(req.body);
        user.password = undefined;

        res.status(201).json(createSuccessResponse('User registered successfully', { user, token }, 201));
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await userService.loginUser(email, password);
        user.password = undefined;

        res.status(200).json(createSuccessResponse('Login successful', { user, token }));
    } catch (error) {
        next(error);
    }
};
