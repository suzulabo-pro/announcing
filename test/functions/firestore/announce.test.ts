import { announcesDeleteHandler } from '../../../src/functions/firestore';
import { FakeFirestore } from '../fake-firestore';

describe('announcesDeleteHandler', () => {
  it('clear all posts', async () => {
    const data = {
      announces: {
        '111111111111': {
          mid: '1',
          posts: { '1': {}, '2': {}, '3': {} },
          _collections: {
            meta: {
              '1': {
                name: 'test',
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
    const firestore = new FakeFirestore(data);

    await announcesDeleteHandler(
      firestore.doc('announces/111111111111').get() as any,
      {} as any,
      firestore.adminApp(),
    );
    expect(data.announces[111111111111]._collections.meta).toStrictEqual({});
    expect(data.announces[111111111111]._collections.posts).toStrictEqual({});
  });
});
