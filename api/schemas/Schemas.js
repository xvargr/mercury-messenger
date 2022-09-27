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

// ? using mongoose validation instead, weird problems with Joi here
// const messageSchema = Joi.object({
//   sender: Joi.object().required(),
//   channel: Joi.object().required(),
//   group: Joi.object().required(),
//   content: Joi.array().items(
//     Joi.object({
//       mentions: Joi.array().items(Joi.object()),
//       text: Joi.string().min(1).max(256),
//       file: Joi.string().allow(null),
//       dateString: Joi.string(),
//       timestamp: Joi.number(),
//       __parentArray: Joi.any(),
//       __index: Joi.any(),
//       $__parent: Joi.any(),
//       $__: Joi.any(),
//       _doc: Joi.any(),
//     })
//   ),
//   $__: Joi.any(),
//   _doc: Joi.any(),
// }).required();

export { groupSchema, channelSchema, userSchema /*messageSchema*/ };
