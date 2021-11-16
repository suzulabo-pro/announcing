import { httpsCallHandler } from '../../../src/functions/call';
import { FakeFirestore } from '../fake-firestore';

describe('registerExternalAnnounces', () => {
  it('set data', async () => {
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

    console.log(user.externalAnnounces[0]);
    const externalAnnounces = data['external_announces'][user.externalAnnounces[0]];
    expect(externalAnnounces).toEqual({
      urlPrefix: 'https://announcing.test/announces/',
      pubKey: '1234567890',
      announces: [],
      uT: expect.any(Date),
    });
  });
});
