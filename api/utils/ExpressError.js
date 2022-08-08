class ExpressError extends Error {
  constructor(message, status) {
    super();
    this.status = status;
    this.message = message;
    // adds msg and status to errors
  }
}

export default ExpressError;
