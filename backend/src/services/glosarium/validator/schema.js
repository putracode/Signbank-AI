import Joi from "joi";

export const createSchema = Joi.object({
  termName: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
});

export const updateSchema = Joi.object({
  termName: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
});
