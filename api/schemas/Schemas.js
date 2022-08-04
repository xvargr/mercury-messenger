import Joi from "joi";

const channelSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  type: Joi.string().valid("text", "task"),
}).required();

export { channelSchema };
