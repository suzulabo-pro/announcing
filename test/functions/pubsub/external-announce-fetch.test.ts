import { Timestamp } from 'firebase-admin/firestore';
import nock from 'nock';
import { pubsubExternalAnnounceFetch } from '../../../src/functions/pubsub/external-announce-fetch';
import { RetryError } from '../../../src/functions/pubsub/retry-error';
import { toMD5Base62 } from '../../../src/functions/utils/firestore';
import { FakeFirestore } from '../fake-firestore';

describe('pubsubExternalAnnounceFetch', () => {
  process.env['FETCH_TIMEOUT'] = '1000';

  afterEach(() => {
    nock.cleanAll();
  });

  const invoke = async (params?: { data?: any; readonly?: boolean }) => {
    const uT = new Date();

    const data = params?.data || {
      'external-announces': {
        ABCDE: {
          _collections: {
            ping: {
              A: {
                url: 'https://test.announcing.app/external/A.json',
                uT,
              },
            },
          },
        },
      },
    };
    const firestore = new FakeFirestore(data, params?.readonly);

    await pubsubExternalAnnounceFetch(
      {
        json: {
          id: 'ABCDE',
          idSuffix: 'A',
          uT: uT.getTime(),
        },
      } as any,
      {} as any,
      firestore.adminApp(),
    );

    return firestore;
  };

  it('ok', async () => {
    nock('https://test.announcing.app')
      .get('/external/A.json')
      .reply(200, {
        id: 'A',
        key: toMD5Base62('ABCDE'),
        info: { name: 'test announce' },
        posts: [{ body: 'test', pT: '2021-09-09T12:24:56' }],
      });

    const firestore = await invoke();

    const announce = firestore.doc('announces/ABCDE-A').get().data();
    expect(announce).toEqual({
      mid: '4JRJu8iX',
      posts: { '571uPqei': { pT: expect.any(Timestamp) } },
      uT: expect.any(Timestamp),
    });
  });

  it('connection timeout', async () => {
    nock('https://test.announcing.app')
      .get('/external/A.json')
      .delayConnection(1500)
      .reply(200, {});

    await expect(invoke({ readonly: true })).rejects.toThrow(RetryError);
  });

  it('body timeout', async () => {
    nock('https://test.announcing.app').get('/external/A.json').delayBody(1500).reply(200, {});

    await expect(invoke({ readonly: true })).rejects.toThrow(RetryError);
  });

  it('no external-announces', async () => {
    nock('https://test.announcing.app')
      .get('/external/A.json')
      .reply(200, {
        id: 'A',
        key: toMD5Base62('ABCDE'),
        info: { name: 'test announce' },
        posts: [{ body: 'test', pT: '2021-09-09T12:24:56' }],
      });

    await invoke({
      readonly: true,
      data: {},
    });
  });

  it('json error', async () => {
    nock('https://test.announcing.app').get('/external/A.json').reply(200, 'hello');

    await invoke({ readonly: true });
  });

  it('parentID', async () => {
    nock('https://test.announcing.app')
      .get('/external/A.json')
      .reply(200, {
        id: 'A',
        key: toMD5Base62('ABCDE'),
        info: { name: 'test announce' },
        posts: [
          { body: 'parent', pT: '2021-09-09T12:24:56', cID: 'AAA' },
          { body: 'child', pT: '2021-09-09T12:24:56', parentID: 'AAA' },
        ],
      });

    const firestore = await invoke();
    const announce = firestore.doc('announces/ABCDE-A').get().data();
    expect(announce?.['posts']['4PF3BY6s'].parent).toEqual('4c29MVcQ');
  });

  it('404 error', async () => {
    nock('https://test.announcing.app').get('/external/A.json').reply(404, 'not found');

    await invoke({ readonly: true });
  });

  it('500 error', async () => {
    nock('https://test.announcing.app').get('/external/A.json').reply(500, 'error');

    await expect(invoke({ readonly: true })).rejects.toThrow(RetryError);
  });
});
