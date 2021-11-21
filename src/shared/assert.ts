import { AppError } from './base-error';

export function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new AppError(`Expected 'val' to be defined, but received ${val}`);
  }
}
