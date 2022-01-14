import { httpsCallHandler } from '../../../src/functions/call';
import { FakeFirestore } from '../fake-firestore';

describe('putExternalAnnounces', () => {
  it('basic', async () => {
    const data = {} as any;
    const firestore = new FakeFirestore(data);

    await httpsCallHandler(
      {
        method: 'PutExternalAnnounces',
        urlPrefixes: ['https://announcing.test/announces/'],
        pubKeys: ['123456789012345678901234567890'],
      },
      { auth: { uid: 'AAAAA' } } as any,
      firestore.adminApp(),
    );

    const user = data['users']['AAAAA'];
    expect(user).toEqual({
      externalAnnounces: [expect.any(String)],
      uT: expect.any(Date),
    });

    const externalAnnounces = data['external-announces'][user.externalAnnounces[0]];
    expect(externalAnnounces).toEqual({
      urlPrefixes: ['https://announcing.test/announces/'],
      pubKeys: ['123456789012345678901234567890'],
      uT: expect.any(Date),
    });
  });

  it('update', async () => {
    const data = {
      'users': {
        AAAAA: {
          externalAnnounces: ['ABCDE'],
        },
      },
      'external-announces': {
        ABCDE: {
          urlPrefixes: ['https://announcing.test/announces/'],
          pubKeys: ['currentKey'],
          announces: ['1'],
        },
      },
    } as any;
    const firestore = new FakeFirestore(data);

    await httpsCallHandler(
      {
        method: 'PutExternalAnnounces',
        id: 'ABCDE',
        urlPrefixes: ['https://announcing.test/announces/updated'],
        pubKeys: ['updatedKey_123456789012345678901234567890'],
      },
      { auth: { uid: 'AAAAA' } } as any,
      firestore.adminApp(),
    );

    const externalAnnounces = data['external-announces']['ABCDE'];
    expect(externalAnnounces).toEqual({
      urlPrefixes: ['https://announcing.test/announces/updated'],
      pubKeys: ['updatedKey_123456789012345678901234567890'],
      announces: ['1'],
      uT: expect.any(Date),
    });
  });
});

describe('deleteExternalAnnounces', () => {
  it('basic', async () => {
    const data = {
      'users': {
        AAAAA: {
          externalAnnounces: ['ABCDE'],
        },
      },
      'external-announces': {
        ABCDE: {
          urlPrefix: 'https://announcing.test/announces/',
          pubKey: 'currentKey_123456789012345678901234567890',
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

    const externalAnnounces = data['external-announces']['ABCDE'];
    expect(externalAnnounces).toBeUndefined();
  });
});
