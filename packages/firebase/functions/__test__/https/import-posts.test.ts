import { httpsRequestHandler } from '../../src/https';
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
      header: () => {
        return;
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };

    await httpsRequestHandler(req as any, res as any, new FakeFirestore(data).adminApp());
    expect(res.status.mock.calls[0][0]).toEqual(200);
    expect(res.send.mock.calls[0][0]).toEqual({ reqID: '', status: 'ok' });
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
      header: () => {
        return;
      },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis() };

    await httpsRequestHandler(req as any, res as any, new FakeFirestore(data).adminApp());
    expect(res.status.mock.calls[0][0]).toEqual(400);
    expect(res.send.mock.calls[0][0]).toEqual({ msg: 'bad path (secKey)', status: 'error' });
    expect(data['import-posts']['123456789012']['requested']).toBeUndefined();
  });
  it('import-url', async () => {
    const data = {
      'import-posts': {
        '123456789012': {
          url: 'https://announcing.test/post.json',
          pubKey: 'gNVuBotzWX4PVRta6jIamlfIa0xH4zn1Zay16WdR9ym',
        },
      },
    } as any;

    const req = {
      path: '/import-posts/123456789012/Bu6jbt95uheLCtzNBcO0YMAdVkCgZuFhw7BgJ0XfuFQ',
      header: () => {
        return 'https://announcing.test/post.json?token=ABCD';
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };

    await httpsRequestHandler(req as any, res as any, new FakeFirestore(data).adminApp());
    expect(res.status.mock.calls[0][0]).toEqual(200);
    expect(res.send.mock.calls[0][0]).toEqual({
      reqID: 'https://announcing.test/post.json?token=ABCD',
      status: 'ok',
    });
    expect(data['import-posts']['123456789012']['requested']).toEqual(true);
  });

  it('import-url error', async () => {
    const data = {
      'import-posts': {
        '123456789012': {
          url: 'https://announcing.test/post.json',
          pubKey: 'gNVuBotzWX4PVRta6jIamlfIa0xH4zn1Zay16WdR9ym',
        },
      },
    } as any;

    const req = {
      path: '/import-posts/123456789012/Bu6jbt95uheLCtzNBcO0YMAdVkCgZuFhw7BgJ0XfuFQ',
      header: () => {
        return 'https://announcing.test/not-match.json?token=ABCD';
      },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis() };

    await httpsRequestHandler(req as any, res as any, new FakeFirestore(data).adminApp());
    expect(res.status.mock.calls[0][0]).toEqual(400);
  });
});
