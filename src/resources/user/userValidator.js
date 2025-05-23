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
    email: Joi.string().optional(),
    image: Joi.string().optional(),
  }),
};
module.exports = userValidator;
