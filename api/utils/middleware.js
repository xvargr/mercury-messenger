// import { express } from "express";
import { channelSchema } from "../schemas/Schemas.js";
import ExpressError from "./ExpressError.js";
// import { errorWrapper } from "./errorWrapper.js";

// throws an error if validation fails on channel
async function validateChannel(req, res, next) {
  const { name, type } = req.body;
  let validation = channelSchema.validate({ name, type });
  // console.log(validation.error.details[0].message);
  if (validation.error) {
    // console.log("VALIDATION ERROR : ", validation.error.details[0].message);
    next(new ExpressError(validation.error.details[0].message, 400)); //! <-- Important, in async functions, we must pass errors on to next
    // throw new ExpressError(...); //! will not work here, app will crash, unhandled error
    // * next() will call the next route handler, but if something were to be passed to it, i.e. next(err), the default express error handler will be called (or the next error handler)
  } else {
    // console.log("VALIDATION PASSED");
    next();
  }
}

export { validateChannel };
