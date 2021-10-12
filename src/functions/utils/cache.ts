export class Cache<T extends Record<string, any>> {
  constructor(private m = new Map<string, WeakRef<T>>()) {}
  set(k: string, v: T) {
    this.m.set(k, new WeakRef(v));
  }
  get(k: string): T | undefined {
    const ref = this.m.get(k);
    if (!ref) {
      return;
    }
    const v = ref.deref();
    if (!v) {
      this.m.delete(k);
    }
    return v;
  }
}
