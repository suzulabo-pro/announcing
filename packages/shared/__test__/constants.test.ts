import { bs62 } from '../src';

describe('constants', () => {
  it('[EXPERIMENT] length of base62 of md5', () => {
    const data00 = new Uint8Array(16).fill(0);
    {
      const s = bs62.encode(data00);
      expect(s.length).toEqual(16);
    }
    const dataff = new Uint8Array(16).fill(0xff);
    {
      const s = bs62.encode(dataff);
      expect(s.length).toEqual(22);
    }
  });

  it('[EXPERIMENT] length of base62 of nacl key', () => {
    const data00 = new Uint8Array(32).fill(0);
    {
      const s = bs62.encode(data00);
      expect(s.length).toEqual(32);
    }

    const dataff = new Uint8Array(32).fill(0xff);
    {
      const s = bs62.encode(dataff);
      expect(s.length).toEqual(43);
    }
  });

  it('[EXPERIMENT] length of base62 of nacl sign', () => {
    const data00 = new Uint8Array(64).fill(0);
    {
      const s = bs62.encode(data00);
      expect(s.length).toEqual(64);
    }

    const dataff = new Uint8Array(64).fill(0xff);
    {
      const s = bs62.encode(dataff);
      expect(s.length).toEqual(86);
    }
  });
});
