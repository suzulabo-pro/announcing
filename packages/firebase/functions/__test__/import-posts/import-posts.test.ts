import { _importPostsJSON } from '../../src/import-posts/import-posts';
import { FakeFirestore } from '../fake-firestore';

describe('importPostsJSON', () => {
  it('json error', async () => {
    await expect(_importPostsJSON(new FakeFirestore({}) as any, 'test', '')).rejects.toThrow();
  });

  it('no announce', async () => {
    await expect(
      _importPostsJSON(
        new FakeFirestore({}) as any,
        '111111111111',
        '{"posts":[{"body":"test","pT":"2021-09-09T12:24:56"}]}',
      ),
    ).rejects.toThrow();
  });

  it('new posts', async () => {
    const data = { announces: { '111111111111': { posts: {} } } };

    await expect(
      _importPostsJSON(
        new FakeFirestore(data) as any,
        '111111111111',
        '{"posts":[{"body":"test","pT":"2021-09-09T12:24:56"}]}',
      ),
    ).resolves.toBeUndefined();
  });
});
