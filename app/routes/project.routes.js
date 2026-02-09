const Joi = require('joi');
const projectController = require('../controllers/projectController');

const idParamSchema = {
    id: Joi.string().hex().length(24).required()
};

const projectBodySchema = {
    name: Joi.string().required(),
    description: Joi.string().optional().allow('')
};

module.exports = [
    {
        method: 'POST',
        path: '/v1/projects',
        joiSchemaForSwagger: {
            body: {
                name: Joi.string().required(),
                description: Joi.string().optional()
            },
            group: 'Projects',
            description: 'Create a new project'
        },
        auth: true,
        handler: projectController.create
    },
    {
        method: 'GET',
        path: '/v1/projects',
        auth: true,
        handler: projectController.getAll
    },
    {
        method: 'GET',
        path: '/v1/projects/:id',
        joiSchemaForSwagger: {
            params: idParamSchema,
            group: 'Projects',
            description: 'Get project by ID'
        },
        auth: true,
        handler: projectController.getOne
    },
    {
        method: 'PATCH',
        path: '/v1/projects/:id',
        joiSchemaForSwagger: {
            params: idParamSchema,
            body: {
                name: Joi.string().optional(),
                description: Joi.string().optional().allow('')
            },
            group: 'Projects',
            description: 'Update project'
        },
        auth: true,
        handler: projectController.update
    },
    {
        method: 'DELETE',
        path: '/v1/projects/:id',
        joiSchemaForSwagger: {
            params: idParamSchema,
            group: 'Projects',
            description: 'Delete project'
        },
        auth: true,
        handler: projectController.delete
    }
];
