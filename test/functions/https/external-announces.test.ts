import { Timestamp } from 'firebase-admin/firestore';
import { httpsRequestHandler } from '../../../src/functions/https';
import { FakeFirestore } from '../fake-firestore';

jest.mock('../../../src/functions/pubsub/external-announce-fetch');

describe('pingExternalAnnounce', () => {
  it('ok', async () => {
    const data = {
      'external-announces': {
        ABCDE: {
          urlPrefixes: ['https://test.announcing.app/external'],
          pubKeys: ['gNVuBotzWX4PVRta6jIamlfIa0xH4zn1Zay16WdR9ym'],
        },
      },
    } as any;

    const req = {
      path: '/external-announces/ABCDE/A',
      header: (k: string) => {
        return {
          'APP-SEC-KEY': 'Bu6jbt95uheLCtzNBcO0YMAdVkCgZuFhw7BgJ0XfuFQ',
          'APP-ANNOUNCE-URL': 'https://test.announcing.app/external/A.json',
        }[k];
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };

    const firestore = new FakeFirestore(data);

    await httpsRequestHandler(req as any, res as any, firestore.adminApp());
    expect(res.status.mock.calls[0][0]).toEqual(200);
    expect(res.send.mock.calls[0][0]).toEqual({ reqID: '', status: 'ok' });

    const pingData = firestore.doc(`external-announces/ABCDE/ping/A`).get().data();
    expect(pingData).toEqual({
      url: 'https://test.announcing.app/external/A.json',
      uT: expect.any(Timestamp),
    });
  });
});
