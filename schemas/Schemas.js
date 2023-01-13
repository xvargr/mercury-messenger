import Joi from "joi";

const groupSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  image: Joi.object({ url: String, filename: String }).required(),
  channels: Joi.object({
    text: [String],
    task: [String],
  }),
  members: Joi.object([String]),
  administrators: Joi.object([String]),
}).required();

const channelSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  type: Joi.string().valid("text", "task"),
}).required();

const userSchema = Joi.object({
  username: Joi.string().min(3).max(20).required(),
  password: Joi.string().min(8).max(200).required(),
  userImage: {
    url: Joi.string(),
    filename: Joi.string(),
  },
}).required();

export { groupSchema, channelSchema, userSchema /*messageSchema*/ };
