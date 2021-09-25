import { httpsCallHandler, __InvalidParamsError } from '../../src/call';
import { FakeFirestore } from '../fake-firestore';

describe('editImportPosts', () => {
  it('set data', async () => {
    const data = {
      users: {
        AAAAA: {
          announces: ['111111111111'],
        },
      },
    } as any;
    const firestore = new FakeFirestore(data);

    await httpsCallHandler(
      {
        method: 'EditImportPosts',
        id: '111111111111',
        url: 'https://announcing.test/import.json',
        pubKey: '1234567890',
      },
      { auth: { uid: 'AAAAA' } } as any,
      firestore.adminApp(),
    );
    expect(data['import-posts']['111111111111']).toEqual({
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
          announces: ['111111111112'],
        },
      },
    } as any;
    const firestore = new FakeFirestore(data);

    await expect(
      httpsCallHandler(
        {
          method: 'EditImportPosts',
          id: '111111111111',
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
          announces: ['111111111111'],
        },
      },
    } as any;
    const firestore = new FakeFirestore(data);

    await expect(
      httpsCallHandler(
        {
          method: 'EditImportPosts',
          id: '111111111111',
          url: 'ftp://announcing.test/import.json',
          pubKey: '1234567890',
        },
        { auth: { uid: 'AAAAA' } } as any,
        firestore.adminApp(),
      ),
    ).rejects.toThrow(__InvalidParamsError);
  });
});
