export class LazyPromise<T> implements PromiseLike<T> {
  constructor(private executor: () => Promise<T>) {}

  private _promise?: Promise<T>;

  private lazyFulfilled: ((value: T) => void)[] = [];
  private lazyRejected: ((reason: any) => void)[] = [];

  private startPromise() {
    if (!this._promise) {
      this._promise = this.executor();
    }

    this._promise.then(
      v => {
        this.lazyFulfilled.forEach(f => f(v));
        this.lazyFulfilled = [];
      },
      reason => {
        this.lazyRejected.forEach(f => f(reason));
        this.lazyRejected = [];
      },
    );

    return this._promise;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.startPromise().then(onfulfilled, onrejected);
  }

  lazyThen(onfulfilled?: (value: T) => void, onrejected?: (reason: any) => void): void {
    if (onfulfilled) this.lazyFulfilled.push(onfulfilled);
    if (onrejected) this.lazyRejected.push(onrejected);
  }
}
