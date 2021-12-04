import { bs62 } from '../../src/shared';

describe('constants', () => {
  it('[EXPERIMENT] length of base62 of 8bytes', () => {
    const data00 = new Uint8Array(8).fill(0);
    {
      const s = bs62.encode(data00);
      expect(s.length).toEqual(8);
    }
    const dataff = new Uint8Array(8).fill(0xff);
    {
      const s = bs62.encode(dataff);
      expect(s.length).toEqual(11);
    }
  });

  it('[EXPERIMENT] length of base62 of 16bytes', () => {
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

  it('[EXPERIMENT] length of base62 of 32bytes', () => {
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

  it('[EXPERIMENT] length of base62 of 64bytes', () => {
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
