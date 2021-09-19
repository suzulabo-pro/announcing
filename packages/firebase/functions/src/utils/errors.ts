export class RetryError extends Error {
  constructor(msg: string) {
    super(msg);
    Error.captureStackTrace(this, RetryError);
  }
}
