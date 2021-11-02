import { httpsRequestHandler } from '../../../src/functions/https';
import { FakeFirestore } from '../fake-firestore';

describe('httpsPingImportPosts', () => {
  const makeData = () => {
    return {
      announces: {
        '123456789012': {
          mid: '12345678',
          posts: { '1': {}, '2': {}, '3': {} },
          _collections: {
            meta: {
              '12345678': {
                name: 'test',
                cT: {
                  toMillis: () => 0,
                },
              },
            },
            posts: {
              '1': {
                title: 'p1',
              },
              '2': {
                title: 'p2',
              },
              '3': {
                title: 'p3',
              },
            },
          },
        },
      },
    };
  };

  it('meta', async () => {
    const data = makeData();

    const req = {
      path: '/data/announces/123456789012/meta/12345678',
      header: () => {
        return;
      },
    };
    const res = {
      setHeader: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    await httpsRequestHandler(req as any, res as any, new FakeFirestore(data).adminApp());
    expect(res.json.mock.calls[0][0]).toEqual({ name: 'test', cT: 0 });
  });
});
