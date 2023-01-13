// ery catch wrapper, any errors will be caught and passed to next
export default function asyncErrorWrapper(target) {
  return function (req, res, next) {
    target(req, res, next).catch(next);
  };
}
