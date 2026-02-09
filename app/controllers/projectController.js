const projectService = require('../services/projectService');
const { createSuccessResponse } = require('../helpers');

exports.create = async (req, res, next) => {
    try {
        const project = await projectService.createProject(req.body, req.user._id);
        res.status(201).json(createSuccessResponse('Project created', project, 201));
    } catch (error) {
        next(error);
    }
};

exports.getAll = async (req, res, next) => {
    try {
        const projects = await projectService.getProjects(req.user._id);
        res.status(200).json(createSuccessResponse('Projects retrieved', projects));
    } catch (error) {
        next(error);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const project = await projectService.getProjectById(req.params.id, req.user._id);
        res.status(200).json(createSuccessResponse('Project retrieved', project));
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const project = await projectService.updateProject(req.params.id, req.body, req.user._id);
        res.status(200).json(createSuccessResponse('Project updated', project));
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        await projectService.deleteProject(req.params.id, req.user._id);
        res.status(200).json(createSuccessResponse('Project deleted'));
    } catch (error) {
        next(error);
    }
};
