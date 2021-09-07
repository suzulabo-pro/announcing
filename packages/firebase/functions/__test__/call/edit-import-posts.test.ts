import { callEditImportPosts } from '../../src/call/edit-import-posts';
import { FakeFirestore } from '../fake-firestore';

describe('callEditImportPosts', () => {
  it('set data', async () => {
    const data = {
      users: {
        AAAAA: {
          announces: ['1111111111'],
        },
      },
    } as any;
    const firestore = new FakeFirestore(data);

    await callEditImportPosts(
      {
        id: '1111111111',
        url: 'https://announcing.test/import.json',
        pubKey: '1234567890',
      },
      { auth: { uid: 'AAAAA' } } as any,
      firestore.adminApp(),
    );
    expect(data['import-posts']['1111111111']).toEqual({
      url: 'https://announcing.test/import.json',
      pubKey: '1234567890',
      requested: false,
      uT: expect.any(Date),
    });
  });

  it('not owner', async () => {
    const data = {
      users: {
        AAAAA: {
          announces: ['1111111112'],
        },
      },
    } as any;
    const firestore = new FakeFirestore(data);

    await expect(
      callEditImportPosts(
        {
          id: '1111111111',
          url: 'https://announcing.test/import.json',
          pubKey: '1234567890',
        },
        { auth: { uid: 'AAAAA' } } as any,
        firestore.adminApp(),
      ),
    ).rejects.toThrow('not Owner');
  });

  it('invalid URL', async () => {
    const data = {
      users: {
        AAAAA: {
          announces: ['1111111111'],
        },
      },
    } as any;
    const firestore = new FakeFirestore(data);

    await expect(
      callEditImportPosts(
        {
          id: '1111111111',
          url: 'ftp://announcing.test/import.json',
          pubKey: '1234567890',
        } as any,
        { auth: { uid: 'AAAAA' } } as any,
        firestore.adminApp(),
      ),
    ).rejects.toThrow('invalid protocol');
  });
});
