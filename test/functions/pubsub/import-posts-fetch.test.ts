import nock from 'nock';
import { pubsubImportPostsFetch } from '../../../src/functions/pubsub/import-posts-fetch';
import { RetryError } from '../../../src/functions/pubsub/retry-error';
import { FakeFirestore } from '../fake-firestore';

describe('firestoreUpdateImportPosts', () => {
  process.env['FETCH_TIMEOUT'] = '1000';

  afterEach(() => {
    nock.cleanAll();
  });

  const invoke = async (params?: { data?: any; readonly?: boolean }) => {
    const uT = new Date();

    const data = params?.data || {
      'announces': {
        '111111111111': {
          posts: { '1': {}, '2': {}, '3': {} },
        },
      },
      'import-posts': {
        '111111111111': {
          url: 'https://announcing.test/posts.json',
          requestedURL: 'https://announcing.test/posts.json',
          uT,
        },
      },
    };
    const firestore = new FakeFirestore(data, params?.readonly);

    await pubsubImportPostsFetch(
      {
        json: {
          id: '111111111111',
          uT: uT.getTime(),
        },
      } as any,
      {} as any,
      firestore.adminApp(),
    );

    return data;
  };

  it('ok', async () => {
    nock('https://announcing.test')
      .get('/posts.json')
      .reply(200, { posts: [{ body: 'test', pT: '2021-09-09T12:24:56' }] });

    const data = await invoke();

    const announce = data.announces['111111111111'];
    expect(announce.uT).toEqual(expect.any(Date));
    const post = announce['_collections']['posts']['571uPqei'];
    expect(post.body).toEqual('test');
    expect(new Date(post.pT['_seconds'] * 1000).toISOString()).toEqual('2021-09-09T12:24:56.000Z');
  });

  it('connection timeout', async () => {
    nock('https://announcing.test')
      .get('/posts.json')
      .delayConnection(1500)
      .reply(200, { posts: [{ body: 'testing', pT: '2021-09-09T12:24:56' }] });

    await expect(invoke({ readonly: true })).rejects.toThrow(RetryError);
  });

  it('body timeout', async () => {
    nock('https://announcing.test')
      .get('/posts.json')
      .delayBody(1500)
      .reply(200, { posts: [{ body: 'testing', pT: '2021-09-09T12:24:56' }] });

    await expect(invoke({ readonly: true })).rejects.toThrow(RetryError);
  });

  it('no announce', async () => {
    nock('https://announcing.test')
      .get('/posts.json')
      .reply(200, { posts: [{ body: 'test', pT: '2021-09-09T12:24:56' }] });

    await invoke({
      readonly: true,
      data: {
        'import-posts': {
          '111111111111': {
            url: 'https://announcing.test/posts.json',
            requestedURL: 'https://announcing.test/posts.json',
            uT: new Date(),
          },
        },
      },
    });
  });

  it('json error', async () => {
    nock('https://announcing.test').get('/posts.json').reply(200, 'hello');

    await invoke({ readonly: true });
  });

  it('parentID', async () => {
    nock('https://announcing.test')
      .get('/posts.json')
      .reply(200, {
        posts: [
          { body: 'parent', pT: '2021-09-09T12:24:56', cID: 'AAA' },
          { body: 'child', pT: '2021-09-09T12:24:56', parentID: 'AAA' },
        ],
      });

    const data = await invoke();
    const announce = data.announces['111111111111'];
    expect(announce.posts['4PF3BY6s'].parent).toEqual('4c29MVcQ');
  });

  it('404 error', async () => {
    nock('https://announcing.test').get('/posts.json').reply(404, 'not found');

    await invoke();
  });

  it('500 error', async () => {
    nock('https://announcing.test').get('/posts.json').reply(500, 'error');

    await expect(invoke({ readonly: true })).rejects.toThrow(RetryError);
  });

  it('URL error', async () => {
    const now = new Date();
    await invoke({
      readonly: true,
      data: {
        'announces': {
          '111111111111': {
            posts: { '1': {}, '2': {}, '3': {} },
          },
        },
        'import-posts': {
          '111111111111': {
            url: 'https://announcing.announcing/posts.json',
            requestedURL: 'https://announcing.announcing/posts.json',
            uT: now,
          },
        },
      },
    });
  });
});
