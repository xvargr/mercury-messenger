class ExpressError extends Error {
  constructor(message, status, respond) {
    super();
    this.status = status;
    this.message = message;
    this.respond = respond;
  }
}

export default ExpressError;
