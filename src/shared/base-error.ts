export class BaseError extends Error {
  protected constructor(msg?: string) {
    super(msg);
    this.name = new.target.name;
  }
}

export class AppError extends BaseError {
  constructor(public msg?: string, public info?: Record<string, any>) {
    super(msg);
  }
}
