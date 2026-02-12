const Project = require('../models/Project');
const Task = require('../models/Task');

exports.createProject = async (payload, userId) => {
    const project = await Project.create({
        name: payload.name,
        description: payload.description,
        owner: userId
    });
    return project;
};

exports.getProjects = async (userId) => {
    return await Project.find({
        $or: [
            { owner: userId },
            { members: userId }
        ],
        isDeleted: false
    });
};

exports.getProjectById = async (id, userId) => {
    const project = await Project.findOne({ _id: id, owner: userId, isDeleted: false });
    if (!project) {
        const error = new Error('Project not found or unauthorized');
        error.statusCode = 404;
        throw error;
    }
    return project;
};

exports.updateProject = async (id, payload, userId) => {
    const project = await Project.findOneAndUpdate(
        { _id: id, owner: userId, isDeleted: false },
        payload,
        { new: true, runValidators: true }
    );

    if (!project) {
        const error = new Error('Project not found or unauthorized');
        error.statusCode = 404;
        throw error;
    }
    return project;
};

exports.deleteProject = async (id, userId) => {
    const project = await Project.findOneAndUpdate(
        { _id: id, owner: userId, isDeleted: false },
        { isDeleted: true },
        { new: true }
    );

    if (!project) {
        const error = new Error('Project not found or unauthorized');
        error.statusCode = 404;
        throw error;
    }

    // Cascade Soft Delete: Mark all tasks in this project as deleted
    await Task.updateMany(
        { project: id, isDeleted: false },
        { isDeleted: true }
    );

    return project;
};
