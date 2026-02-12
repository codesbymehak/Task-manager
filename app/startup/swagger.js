const swaggerUi = require('swagger-ui-express');
const joiToSwagger = require('joi-to-swagger');
const Joi = require('joi');
const authRoutes = require('../routes/auth.routes');
const projectRoutes = require('../routes/project.routes');
const taskRoutes = require('../routes/task.routes');

const generateSwaggerSpec = () => {
    const spec = {
        openapi: '3.0.0',
        info: {
            title: 'Task Manager API',
            version: '1.0.0',
            description: 'API Documentation for Task Manager System'
        },
        servers: [
            {
                url: 'http://localhost:5001',
                description: 'Local server'
            }
        ],
        paths: {},
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    };

    const allRoutes = [
        ...authRoutes,
        ...projectRoutes,
        ...taskRoutes
    ];

    allRoutes.forEach(route => {
        const { method, path, joiSchemaForSwagger, auth } = route;

        // Convert Express path parameters (:id) to Swagger format ({id})
        const swaggerPath = path.replace(/:(\w+)/g, '{$1}');

        if (!spec.paths[swaggerPath]) {
            spec.paths[swaggerPath] = {};
        }

        const operation = {
            tags: [joiSchemaForSwagger?.group || 'Default'],
            summary: joiSchemaForSwagger?.description || '',
            responses: {
                200: { description: 'Success' },
                400: { description: 'Bad Request' },
                401: { description: 'Unauthorized' },
                500: { description: 'Internal Server Error' }
            }
        };

        if (auth) {
            operation.security = [{ bearerAuth: [] }];
        }

        if (joiSchemaForSwagger) {
            if (joiSchemaForSwagger.body) {
                const { swagger } = joiToSwagger(Joi.object(joiSchemaForSwagger.body));
                operation.requestBody = {
                    content: {
                        'application/json': {
                            schema: swagger
                        }
                    }
                };
            }

            if (joiSchemaForSwagger.params || joiSchemaForSwagger.query) {
                operation.parameters = [];

                if (joiSchemaForSwagger.params) {
                    const { swagger } = joiToSwagger(Joi.object(joiSchemaForSwagger.params));
                    Object.keys(swagger.properties).forEach(key => {
                        operation.parameters.push({
                            name: key,
                            in: 'path',
                            required: true,
                            schema: swagger.properties[key]
                        });
                    });
                }

                if (joiSchemaForSwagger.query) {
                    const { swagger } = joiToSwagger(Joi.object(joiSchemaForSwagger.query));
                    Object.keys(swagger.properties).forEach(key => {
                        operation.parameters.push({
                            name: key,
                            in: 'query',
                            required: swagger.required?.includes(key) || false,
                            schema: swagger.properties[key]
                        });
                    });
                }
            }
        }

        spec.paths[swaggerPath][method.toLowerCase()] = operation;
    });

    return spec;
};

module.exports = (app) => {
    const spec = generateSwaggerSpec();
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
};
