const Joi = require('joi');
const taskController = require('../controllers/taskController');
const { TASK_STATUS } = require('../utils/constants');

const idParamSchema = {
    id: Joi.string().hex().length(24).required()
};

module.exports = [
    {
        method: 'POST',
        path: '/v1/tasks',
        joiSchemaForSwagger: {
            body: {
                title: Joi.string().required(),
                description: Joi.string().optional().allow(''),
                status: Joi.string().valid(...Object.values(TASK_STATUS)).optional(),
                priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
                dueDate: Joi.date().optional(),
                project: Joi.string().hex().length(24).required(),
                assignee: Joi.string().hex().length(24).optional()
            },
            group: 'Tasks',
            description: 'Create a new task'
        },
        auth: true,
        handler: taskController.create
    },
    {
        method: 'GET',
        path: '/v1/tasks',
        joiSchemaForSwagger: {
            query: {
                page: Joi.number().integer().min(1).optional(),
                limit: Joi.number().integer().min(1).optional(),
                status: Joi.string().optional(),
                priority: Joi.string().optional(),
                assignee: Joi.string().optional(),
                project: Joi.string().optional()
            },
            group: 'Tasks',
            description: 'Get tasks with filtering' // Note: 'query' validation handles the schema
        },
        auth: true,
        handler: taskController.getAll
    },
    {
        method: 'PATCH',
        path: '/v1/tasks/:id',
        joiSchemaForSwagger: {
            params: idParamSchema,
            body: {
                title: Joi.string().optional(),
                description: Joi.string().optional().allow(''),
                status: Joi.string().valid(...Object.values(TASK_STATUS)).optional(),
                priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
                dueDate: Joi.date().optional(),
                assignee: Joi.string().hex().length(24).optional()
            },
            group: 'Tasks',
            description: 'Update task'
        },
        auth: true,
        handler: taskController.update
    },
    {
        method: 'DELETE',
        path: '/v1/tasks/:id',
        joiSchemaForSwagger: {
            params: idParamSchema,
            group: 'Tasks',
            description: 'Delete task'
        },
        auth: true,
        handler: taskController.delete
    }
];
