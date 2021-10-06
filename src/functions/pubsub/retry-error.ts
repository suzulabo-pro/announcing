import { BaseError } from '../../shared';

export class RetryError extends BaseError {
  constructor(public error: Error | string) {
    super();
  }
}
