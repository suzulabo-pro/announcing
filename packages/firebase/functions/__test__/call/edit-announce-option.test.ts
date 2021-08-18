import { callEditAnnounceOption } from '../../src/call/edit-announce-option';
import { FakeFirestore } from '../fake-firestore';

describe('callEditAnnounceOption', () => {
  it('set data', async () => {
    const data = {
      users: {
        AAAAA: {
          announces: ['1111111111'],
        },
      },
    } as any;
    const firestore = new FakeFirestore(data);

    await callEditAnnounceOption(
      {
        id: '1111111111',
        importURL: 'https://announcing.test/import.json',
        importToken: '1234567890',
      } as any,
      { auth: { uid: 'AAAAA' } } as any,
      firestore.adminApp(),
    );
    expect(data['announce_options']['1111111111']).toEqual({
      importURL: 'https://announcing.test/import.json',
      importToken: '1234567890',
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
      callEditAnnounceOption(
        {
          id: '1111111111',
          importURL: 'https://announcing.test/import.json',
          importToken: '1234567890',
        } as any,
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
      callEditAnnounceOption(
        {
          id: '1111111111',
          importURL: 'http://announcing.test/import.json',
          importToken: '1234567890',
        } as any,
        { auth: { uid: 'AAAAA' } } as any,
        firestore.adminApp(),
      ),
    ).rejects.toThrow('invalid protocol');
  });
});
