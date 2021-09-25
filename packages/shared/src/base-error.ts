export class BaseError extends Error {
  constructor(msg?: string) {
    super(msg);
    this.name = new.target.name;
  }
}
