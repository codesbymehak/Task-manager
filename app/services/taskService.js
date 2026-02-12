const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

exports.createTask = async (payload, userId) => {

    const project = await Project.findById(payload.project);
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
    if (payload.assignee) {
        if (project.owner.toString() === payload.assignee.toString()) {
            const error = new Error('Project owner cannot be assigned to tasks');
            error.statusCode = 400;
            throw error;
        }

        const assigneeUser = await User.findById(payload.assignee);
        if (!assigneeUser) {
            const error = new Error('Assignee not found');
            error.statusCode = 404;
            throw error;
        }

        // Add assignee to project members if not already present
        if (!project.members.includes(payload.assignee)) {
            project.members.addToSet(payload.assignee);
            await project.save();
        }
    }

    const task = await Task.create({
        title: payload.title,
        description: payload.description,
        project: payload.project,
        assignee: payload.assignee,
        status: payload.status,
        priority: payload.priority,
        dueDate: payload.dueDate,
        isDeleted: false
    });
    return task;
};

exports.getTasks = async (query, userId) => {

    const filter = { isDeleted: false };

    // Filtering based on query params
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.dueDate) filter.dueDate = { $lte: new Date(query.dueDate) }; // Tasks due on or before date
    if (query.searchByTask) {
        filter.title = { $regex: query.searchByTask, $options: 'i' };
    }

    // Project Filter
    let targetProject = null;
    if (query.project) {
        filter.project = query.project;
        targetProject = await Project.findOne({ _id: query.project, isDeleted: false });
    }

    // Case A: User is viewing tasks for a specific project they OWN
    if (targetProject && targetProject.owner.toString() === userId.toString()) {
        if (query.assignee) {
            filter.assignee = query.assignee;
        }
    }
    // Case B: User is viewing specific project but is NOT owner (Member)
    else if (targetProject) {
        filter.assignee = userId;
    }
    else {
        // Get all projects owned by user
        const ownedProjects = await Project.find({ owner: userId, isDeleted: false }).distinct('_id');

        // Logic:
        // - Return tasks where (Project is Owned by Me) OR (Task is Assigned to Me)
        // - If 'assignee' filter is passed, it only applies to Owned projects (since for assigned tasks, assignee is fixed to me)

        const globalAccessConditions = [];

        // Condition 1: Tasks in projects I own
        const ownerCondition = { project: { $in: ownedProjects } };
        if (query.assignee) {
            ownerCondition.assignee = query.assignee; // Owner filtering by specific assignee
        }
        globalAccessConditions.push(ownerCondition);

        // Condition 2: Tasks assigned to me (regardless of project ownership)
        // Note: If I am just a member, I can only see my tasks.
        // If query.assignee is provided and it's NOT me, this condition yields nothing for me as a member.
        if (!query.assignee || query.assignee === userId.toString()) {
            globalAccessConditions.push({ assignee: userId });
        }

        filter.$or = globalAccessConditions;
    }

    // Pagination
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find(filter)
        .populate('assignee', 'name email')
        .populate('project', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await Task.countDocuments(filter);

    return { tasks, total, page, limit };
};

exports.updateTask = async (id, payload, userId) => {
    // Check access first
    const task = await Task.findOne({ _id: id, isDeleted: false }).populate('project');
    if (!task) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
    }

    const isOwner = task.project.owner.toString() === userId.toString();
    const isAssignee = task.assignee && task.assignee.toString() === userId.toString();

    // 1. If user is NEITHER owner NOR assignee -> GTFO
    if (!isOwner && !isAssignee) {
        const error = new Error('Not authorized to update this task');
        error.statusCode = 403;
        throw error;
    }

    // 2. If user is Assignee (but NOT Owner), ensure they are ONLY updating 'status'
    if (isAssignee && !isOwner) {
        const updates = Object.keys(payload);
        const isStatusOnly = updates.length === 1 && updates[0] === 'status';

        if (!isStatusOnly) {
            const error = new Error('Assignees can only update task status');
            error.statusCode = 403;
            throw error;
        }
    }

    // 2.5 Prevent assigning to Project Owner
    if (payload.assignee) {
        if (task.project.owner.toString() === payload.assignee.toString()) {
            const error = new Error('Project owner cannot be assigned to tasks');
            error.statusCode = 400;
            throw error;
        }
    }

    // 3. Proceed with update
    const updatedTask = await Task.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    }).populate('assignee', 'name email');

    // 4. If assignee changed, add new assignee to project members
    if (payload.assignee && payload.assignee !== task.assignee?.toString()) {
        await Project.findByIdAndUpdate(task.project._id, {
            $addToSet: { members: payload.assignee }
        });
    }

    return updatedTask;
};

exports.deleteTask = async (id, userId) => {
    const task = await Task.findOne({ _id: id, isDeleted: false }).populate('project');
    if (!task) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
    }

    const isOwner = task.project.owner.toString() === userId.toString();

    if (!isOwner) {
        const error = new Error('Not authorized to delete this task');
        error.statusCode = 403;
        throw error;
    }

    task.isDeleted = true;
    await task.save();
    return task;
};
