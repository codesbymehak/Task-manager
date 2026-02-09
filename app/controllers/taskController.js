const taskService = require('../services/taskService');
const { createSuccessResponse } = require('../helpers');

exports.create = async (req, res, next) => {
    try {
        const task = await taskService.createTask(req.body, req.user._id);
        res.status(201).json(createSuccessResponse('Task created', task, 201));
    } catch (error) {
        next(error);
    }
};

exports.getAll = async (req, res, next) => {
    try {
        const result = await taskService.getTasks(req.query, req.user._id);
        res.status(200).json(createSuccessResponse('Tasks retrieved', result));
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const task = await taskService.updateTask(req.params.id, req.body, req.user._id);
        res.status(200).json(createSuccessResponse('Task updated', task));
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        await taskService.deleteTask(req.params.id, req.user._id);
        res.status(200).json(createSuccessResponse('Task deleted'));
    } catch (error) {
        next(error);
    }
};
