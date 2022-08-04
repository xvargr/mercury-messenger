class ExpressError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.message = message;
    // adds msg and status to errors
  }
}

export default ExpressError;
