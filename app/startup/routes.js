const express = require('express');
const validate = require('../middlewares/validate');
const protect = require('../middlewares/auth');
const authRoutes = require('../routes/auth.routes');
const projectRoutes = require('../routes/project.routes');
const taskRoutes = require('../routes/task.routes');

const applyRoutes = (app) => {
    const router = express.Router();

    const registerRoutes = (routes) => {
        routes.forEach(route => {
            const { method, path, handler, auth, joiSchemaForSwagger } = route;
            const middlewares = [];

            if (auth) {
                middlewares.push(protect);
            }

            if (joiSchemaForSwagger) {
                middlewares.push(validate(joiSchemaForSwagger));
            }

            router[method.toLowerCase()](path, ...middlewares, handler);
        });
    };

    if (authRoutes) registerRoutes(authRoutes);
    if (projectRoutes) registerRoutes(projectRoutes);
    if (taskRoutes) registerRoutes(taskRoutes);

    app.use('/', router);
};

module.exports = applyRoutes;
