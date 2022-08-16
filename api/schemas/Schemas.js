import Joi from "joi";

const groupSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  image: Joi.object({ url: String, filename: String }).required(),
  channels: Joi.object({
    text: [String],
    task: [String],
  }),
}).required();

const channelSchema = Joi.object({
  // group: Joi.string().required(),
  name: Joi.string().min(3).max(20).required(),
  type: Joi.string().valid("text", "task"),
}).required();

// todo userSchema

export { groupSchema, channelSchema };
