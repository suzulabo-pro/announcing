export const stripObj = <T extends Record<string, any>>(r: T) => {
  for (const [k, v] of Object.entries(r)) {
    if (v === undefined || v === '' || v === null) {
      delete r[k];
    }
  }
  return r;
};
