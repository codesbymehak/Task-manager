const Task = require('../models/Task');
const Project = require('../models/Project'); // To check project access

exports.createTask = async (data, userId) => {

    const project = await Project.findById(data.project);
    if (!project) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    if (project.owner.toString() !== userId.toString()) {
        const error = new Error('Not authorized to add tasks to this project');
        error.statusCode = 403;
        throw error;
    }

    const task = await Task.create({
        ...data,
        reporter: userId
    });
    return task;
};

exports.getTasks = async (query, userId) => {
    // Filtering
    const filter = {};
    if (query.status) {
        filter.status = query.status;
    }
    if (query.priority) {
        filter.priority = query.priority;
    }
    if (query.assignee) {
        filter.assignee = query.assignee;
    }
    if (query.project) {
        filter.project = query.project;
        const project = await Project.findById(query.project);
        if (project && project.owner.toString() === userId.toString()) {
        } else if (project) {
            filter.project = query.project;
        }
    }
    const userProjects = await Project.find({ owner: userId }).distinct('_id');

    const accessCondition = {
        $or: [
            { project: { $in: userProjects } },
            { assignee: userId },
            { reporter: userId }
        ]
    };

    const finalFilter = { ...filter, ...accessCondition };

    // Pagination
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find(finalFilter)
        .populate('assignee', 'name email')
        .populate('project', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await Task.countDocuments(finalFilter);

    return { tasks, total, page, limit };
};

exports.updateTask = async (id, data, userId) => {
    // Check access first
    const task = await Task.findById(id).populate('project');
    if (!task) {
        throw new AppError('Task not found', 404);
    }

    const isOwner = task.project.owner.toString() === userId.toString();
    const isReporter = task.reporter.toString() === userId.toString();
    const isAssignee = task.assignee && task.assignee.toString() === userId.toString();

    if (!isOwner && !isReporter) {
        const error = new Error('Not authorized to update this task');
        error.statusCode = 403;
        throw error;
    }

    const updatedTask = await Task.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    }).populate('assignee', 'name email');

    return updatedTask;
};

exports.deleteTask = async (id, userId) => {
    const task = await Task.findById(id).populate('project');
    if (!task) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
    }

    const isOwner = task.project.owner.toString() === userId.toString();
    const isReporter = task.reporter.toString() === userId.toString();

    if (!isOwner && !isReporter) {
        const error = new Error('Not authorized to delete this task');
        error.statusCode = 403;
        throw error;
    }

    await task.deleteOne();
    return task;
};
