import nacl from 'tweetnacl';
import { httpsPingImportPosts } from '../../src/https/import-posts';
import { bs62 } from '../../src/utils/util';
import { FakeFirestore } from '../fake-firestore';

describe('httpsPingImportPosts', () => {
  it('ok', async () => {
    const data = {
      'import-posts': {
        '123456789012': { url: 'url', pubKey: 'gNVuBotzWX4PVRta6jIamlfIa0xH4zn1Zay16WdR9ym' },
      },
    } as any;

    const req = {
      path: '/import-posts/123456789012/Bu6jbt95uheLCtzNBcO0YMAdVkCgZuFhw7BgJ0XfuFQ',
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis() };

    await httpsPingImportPosts(req as any, res as any, new FakeFirestore(data).adminApp());
    expect(res.status.mock.calls[0][0]).toEqual(200);
    expect(res.send.mock.calls[0][0]).toEqual('ok');
    expect(data['import-posts']['123456789012']['requested']).toEqual(true);
  });

  it('key error', async () => {
    const data = {
      'import-posts': {
        '123456789012': { url: 'url', pubKey: 'gNVuBotzWX4PVRta6jIamlfIa0xH4zn1Zay16WdR9ym' },
      },
    } as any;

    const req = {
      path: '/import-posts/123456789012/Bu6jbt95uheLCtzNBcO0YMAdVkCgZuFhw7BgJ0XfuFQXX',
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis() };

    await httpsPingImportPosts(req as any, res as any, new FakeFirestore(data).adminApp());
    expect(res.status.mock.calls[0][0]).toEqual(400);
    expect(res.send.mock.calls[0][0]).toEqual('bad path');
    expect(data['import-posts']['123456789012']['requested']).toBeUndefined();
  });

  it.skip('gen key', () => {
    const keys = nacl.box.keyPair();
    console.log({
      pubKey: bs62.encode(keys.publicKey),
      secKey: bs62.encode(keys.secretKey),
    });
  });
});
