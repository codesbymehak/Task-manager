const Project = require('../models/Project');

exports.createProject = async (data, userId) => {
    const project = await Project.create({
        ...data,
        owner: userId
    });
    return project;
};

exports.getProjects = async (userId) => {
    return await Project.find({ owner: userId });
};

exports.getProjectById = async (id, userId) => {
    const project = await Project.findOne({ _id: id, owner: userId });
    if (!project) {
        throw new AppError('Project not found or unauthorized', 404);
    }
    return project;
};

exports.updateProject = async (id, data, userId) => {
    const project = await Project.findOneAndUpdate(
        { _id: id, owner: userId },
        data,
        { new: true, runValidators: true }
    );

    if (!project) {
        throw new AppError('Project not found or unauthorized', 404);
    }
    return project;
};

exports.deleteProject = async (id, userId) => {
    const project = await Project.findOneAndDelete({ _id: id, owner: userId });
    if (!project) {
        const error = new Error('Project not found or unauthorized');
        error.statusCode = 404;
        throw error;
    }
    return project;
};
