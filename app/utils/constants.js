module.exports = {
    TASK_STATUS: {
        TODO: 'todo',
        IN_PROGRESS: 'in_progress',
        DONE: 'done'
    },
    AVAILABLE_AUTHS: {
        USER: 'user'
    },
    JWT_SECRET: process.env.JWT_SECRET || 'secret'
};
