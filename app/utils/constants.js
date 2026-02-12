module.exports = {
    TASK_STATUS: {
        TODO: 'todo',
        IN_PROGRESS: 'in_progress',
        DONE: 'done'
    },
    USER_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive'
    },
    AVAILABLE_AUTHS: {
        USER: 'user'
    },
    JWT_SECRET: process.env.JWT_SECRET || 'secret'
};
