import { BaseError } from '@announcing/shared';

export class RetryError extends BaseError {
  constructor(public error: Error | string) {
    super();
  }
}
