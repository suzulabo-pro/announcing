import nock from 'nock';
import { firestoreUpdateImportPosts } from '../../src/firestore/import-posts';
import { RetryError } from '../../src/utils/errors';
import { FakeFirestore } from '../fake-firestore';

describe('firestoreUpdateImportPosts', () => {
  process.env['FETCH_TIMEOUT'] = '1000';

  const invoke = async (_data?: any) => {
    const data = _data || {
      'announces': {
        '111111111111': {
          posts: { '1': {}, '2': {}, '3': {} },
        },
      },
      'import-posts': {
        '111111111111': {
          url: 'https://announcing.test/posts.json',
          requested: true,
        },
      },
    };
    const firestore = new FakeFirestore(data);

    await firestoreUpdateImportPosts(
      {
        before: {
          data: () => {
            return {};
          },
        },
        after: firestore.doc(`import-posts/111111111111`).get(),
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

    expect(data['import-posts']['111111111111']['requested']).toEqual(false);

    const announce = data.announces['111111111111'];
    expect(announce.uT).toEqual(expect.any(Date));
    const post = announce['_collections']['posts']['571uPqei'];
    expect(post.body).toEqual('test');
    expect(new Date(post.pT['_seconds'] * 1000).toISOString()).toEqual('2021-09-09T12:24:56.000Z');
  });

  it('timeout', async () => {
    nock('https://announcing.test')
      .get('/posts.json')
      .delayConnection(1100)
      .reply(200, { posts: [{ body: 'testing', pT: '2021-09-09T12:24:56' }] });

    await expect(invoke()).rejects.toThrow(RetryError);

    nock('https://announcing.test')
      .get('/posts.json')
      .delayBody(2000)
      .reply(200, { posts: [{ body: 'testing', pT: '2021-09-09T12:24:56' }] });

    await expect(invoke()).rejects.toThrow(RetryError);
  });

  it('no announce', async () => {
    nock('https://announcing.test')
      .get('/posts.json')
      .reply(200, { posts: [{ body: 'test', pT: '2021-09-09T12:24:56' }] });

    const data = await invoke({
      'import-posts': {
        '111111111111': {
          url: 'https://announcing.test/posts.json',
          requested: true,
        },
      },
    });
    expect(data['import-posts']['111111111111']['requested']).toEqual(false);
  });

  it('json error', async () => {
    nock('https://announcing.test').get('/posts.json').reply(200, 'hello');

    const data = await invoke();
    expect(data['import-posts']['111111111111']['requested']).toEqual(false);
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

    const data = await invoke();
    expect(data['import-posts']['111111111111']['requested']).toEqual(false);
  });

  it('500 error', async () => {
    nock('https://announcing.test').get('/posts.json').reply(500, 'error');

    await expect(invoke()).rejects.toThrow(RetryError);
  });

  it('URL error', async () => {
    const data = await invoke({
      'announces': {
        '111111111111': {
          posts: { '1': {}, '2': {}, '3': {} },
        },
      },
      'import-posts': {
        '111111111111': {
          url: 'https://announcing.announcing/posts.json',
          requested: true,
        },
      },
    });
    expect(data['import-posts']['111111111111']['requested']).toEqual(false);
  });
});
