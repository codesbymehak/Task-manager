const Joi = require('joi');
const { createErrorResponse } = require('../helpers');

const validate = (schema) => (req, res, next) => {
    if (schema.body) {
        const joiSchema = Joi.object(schema.body);
        const { error, value } = joiSchema.validate(req.body);

        if (error) {
            return res.status(400).json(createErrorResponse(error.details[0].message, 400));
        }
        req.body = value;
    }

    if (schema.query) {
        const joiSchema = Joi.object(schema.query);
        const { error, value } = joiSchema.validate(req.query);

        if (error) {
            return res.status(400).json(createErrorResponse(error.details[0].message, 400));
        }
        req.query = value;
    }

    if (schema.params) {
        const joiSchema = Joi.object(schema.params);
        const { error, value } = joiSchema.validate(req.params);

        if (error) {
            return res.status(400).json(createErrorResponse(error.details[0].message, 400));
        }
        req.params = value;
    }
    next();
};

module.exports = validate;
