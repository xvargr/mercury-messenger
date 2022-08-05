import Joi from "joi";

const groupSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
}).required();

const channelSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  type: Joi.string().valid("text", "task"),
}).required();

export { groupSchema, channelSchema };
