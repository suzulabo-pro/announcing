import { httpsCallHandler } from '../../../src/functions/call';
import { FakeFirestore } from '../fake-firestore';

describe('registerExternalAnnounces', () => {
  it('basic', async () => {
    const data = {} as any;
    const firestore = new FakeFirestore(data);

    await httpsCallHandler(
      {
        method: 'RegisterExternalAnnounces',
        urlPrefix: 'https://announcing.test/announces/',
        pubKey: '1234567890',
      },
      { auth: { uid: 'AAAAA' } } as any,
      firestore.adminApp(),
    );

    const user = data['users']['AAAAA'];
    expect(user).toEqual({
      externalAnnounces: [expect.any(String)],
      uT: expect.any(Date),
    });

    const externalAnnounces = data['external_announces'][user.externalAnnounces[0]];
    expect(externalAnnounces).toEqual({
      urlPrefix: 'https://announcing.test/announces/',
      pubKey: '1234567890',
      announces: [],
      uT: expect.any(Date),
    });
  });
});

describe('updateExternalAnnouncesKey', () => {
  it('basic', async () => {
    const data = {
      users: {
        AAAAA: {
          externalAnnounces: ['ABCDE'],
        },
      },
      external_announces: {
        ABCDE: {
          urlPrefix: 'https://announcing.test/announces/',
          pubKey: 'currentKey',
          announces: ['1'],
        },
      },
    } as any;
    const firestore = new FakeFirestore(data);

    await httpsCallHandler(
      {
        method: 'UpdateExternalAnnouncesKey',
        id: 'ABCDE',
        pubKey: 'updatedKey',
      },
      { auth: { uid: 'AAAAA' } } as any,
      firestore.adminApp(),
    );

    const externalAnnounces = data['external_announces']['ABCDE'];
    expect(externalAnnounces).toEqual({
      urlPrefix: 'https://announcing.test/announces/',
      pubKey: 'updatedKey',
      announces: ['1'],
      uT: expect.any(Date),
    });
  });
});

describe('deleteExternalAnnounces', () => {
  it('basic', async () => {
    const data = {
      users: {
        AAAAA: {
          externalAnnounces: ['ABCDE'],
        },
      },
      external_announces: {
        ABCDE: {
          urlPrefix: 'https://announcing.test/announces/',
          pubKey: 'currentKey',
          announces: ['1'],
        },
      },
    } as any;
    const firestore = new FakeFirestore(data);

    await httpsCallHandler(
      {
        method: 'DeleteExternalAnnounces',
        id: 'ABCDE',
      },
      { auth: { uid: 'AAAAA' } } as any,
      firestore.adminApp(),
    );

    const user = data['users']['AAAAA'];
    expect(user).toEqual({
      externalAnnounces: [],
      uT: expect.any(Date),
    });

    const externalAnnounces = data['external_announces']['ABCDE'];
    expect(externalAnnounces).toBeUndefined();
  });
});
