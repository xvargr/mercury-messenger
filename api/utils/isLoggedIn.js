import ExpressError from "./ExpressError.js";

function isLoggedIn(req, res, next) {
  req.isAuthenticated()
    ? next()
    : next(new ExpressError("Not authorized", 401));
}

export default isLoggedIn;
