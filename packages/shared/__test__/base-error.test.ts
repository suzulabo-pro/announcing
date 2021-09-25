import { BaseError } from '../src/base-error';

class MyError extends BaseError {}
class CodeError extends BaseError {
  constructor(message: string, public code: string) {
    super(message);
  }
}

describe('base error', () => {
  it('my error', () => {
    const err = new MyError('error');
    expect(err.name).toEqual('MyError');
    expect(err.message).toEqual('error');
  });
  it('code error', () => {
    const err = new CodeError('error', '1234');
    expect(err.name).toEqual('CodeError');
    expect(err.message).toEqual('error');
    expect(err.code).toEqual('1234');
  });
});
