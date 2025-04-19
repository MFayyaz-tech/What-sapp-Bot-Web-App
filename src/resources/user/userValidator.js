const Joi = require("joi");
const userValidator = {
  signup: Joi.object({
    email: Joi.string().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
    phone: Joi.string().optional(),
    role: Joi.string().required().valid("superadmin", "admin"),
  }),
  login: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
  update: Joi.object({
    name: Joi.string().optional(),
    phone: Joi.string().optional(),
    country: Joi.string().optional(),
    phone: Joi.string().optional(),
  }),
};
module.exports = userValidator;
