import ExpressError from "./ExpressError.js";

function isLoggedIn(req, res, next) {
  req.isAuthenticated() ? next() : next(new ExpressError("Unauthorized", 401));
}

export default isLoggedIn;
