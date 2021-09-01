import nock from 'nock';
import { firestoreUpdateImportPosts } from '../../src/firestore/import-posts';
import { FakeFirestore } from '../fake-firestore';

describe('firestoreUpdateImportPosts', () => {
  process.env['FETCH_TIMEOUT'] = '1000';

  it('ok', async () => {
    const data = {
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

    nock('https://announcing.test')
      .get('/posts.json')
      .reply(200, { posts: [{ body: 'testing', pT: '2021-09-09T12:24:56' }] });

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
  });

  it('timeout', async () => {
    const data = {
      'announces': {
        '111111111111': {},
      },
      'import-posts': {
        '111111111111': {
          url: 'https://announcing.test/posts.json',
          requested: true,
        },
      },
    };
    const firestore = new FakeFirestore(data);

    nock('https://announcing.test')
      .get('/posts.json')
      .delayConnection(1100)
      .reply(200, { posts: [{ body: 'testing', pT: '2021-09-09T12:24:56' }] });

    await expect(
      firestoreUpdateImportPosts(
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
      ),
    ).rejects.toThrow('timeout of 1000ms exceeded');

    nock('https://announcing.test')
      .get('/posts.json')
      .delayBody(2000)
      .reply(200, { posts: [{ body: 'testing', pT: '2021-09-09T12:24:56' }] });

    await expect(
      firestoreUpdateImportPosts(
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
      ),
    ).rejects.toThrow('timeout(timer)');
  });
});
