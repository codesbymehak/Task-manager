const Joi = require('joi');
const userController = require('../controllers/userController');

module.exports = [
    {
        method: 'POST',
        path: '/v1/auth/register',
        joiSchemaForSwagger: {
            body: {
                name: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(8).required()
            },
            group: 'Auth',
            description: 'Register a new user'
        },
        auth: false,
        handler: userController.register
    },
    {
        method: 'POST',
        path: '/v1/auth/login',
        joiSchemaForSwagger: {
            body: {
                email: Joi.string().email().required(),
                password: Joi.string().required()
            },
            group: 'Auth',
            description: 'Login user'
        },
        auth: false,
        handler: userController.login
    }
];

