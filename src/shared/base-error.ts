export class BaseError extends Error {
  _stack: Error['stack'];

  protected constructor(msg?: string) {
    super(msg);
    this.name = new.target.name;
    this._stack = this.stack;
  }
}

export class AppError extends BaseError {
  constructor(public msg?: string, public info?: Record<string, any>) {
    super(msg);
  }
}
