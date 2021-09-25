import { bs62 } from '@announcing/shared';
import { millisToBase62, postIDtoMillis } from '../../src/utils/util';

describe('util', () => {
  it('postIDtoMillis', () => {
    const v = 1618886704000;
    const s = millisToBase62(v);
    expect(s).toEqual('5HNKrmbrTCo');
    expect(postIDtoMillis(s)).toEqual(v);
  });

  it.skip('[EXPERIMENT] length of base62 of md5', () => {
    const data00 = new Uint8Array(16).fill(0);
    {
      const s = bs62.encode(data00);
      console.log(s, s.length);
      expect(s.length).toEqual(16);
    }
    const dataff = new Uint8Array(16).fill(0xff);
    {
      const s = bs62.encode(dataff);
      console.log(s, s.length);
      expect(s.length).toEqual(22);
    }
  });

  it.skip('[EXPERIMENT] length of base62 of nacl key', () => {
    const data00 = new Uint8Array(32).fill(0);
    {
      const s = bs62.encode(data00);
      console.log(s, s.length);
      expect(s.length).toEqual(32);
    }

    const dataff = new Uint8Array(32).fill(0xff);
    {
      const s = bs62.encode(dataff);
      console.log(s, s.length);
      expect(s.length).toEqual(43);
    }
  });

  it.skip('[EXPERIMENT] length of base62 of nacl sign', () => {
    const data00 = new Uint8Array(64).fill(0);
    {
      const s = bs62.encode(data00);
      console.log(s, s.length);
      expect(s.length).toEqual(64);
    }

    const dataff = new Uint8Array(64).fill(0xff);
    {
      const s = bs62.encode(dataff);
      console.log(s, s.length);
      expect(s.length).toEqual(86);
    }
  });
});
