import { validatePostsImportJSON } from '../../src/import-posts/datatypes';

describe('validatePostsImportJSON', () => {
  const tests: [string, any, boolean][] = [
    ['empty', {}, false],
    ['ok', { posts: [{ body: 'testing', uT: '2021-09-09T12:24:56' }] }, true],
    [
      'additional',
      {
        posts: [{ body: 'testing', uT: '2021-09-09T12:24:56' }],
        lol: true,
      },
      false,
    ],
    ['no title body', { posts: [{ uT: '2021-09-09T12:24:56' }] }, false],
    ['null title body', { posts: [{ title: null, body: null, uT: '2021-09-09T12:24:56' }] }, false],
    ['title only', { posts: [{ title: 'title only', uT: '2021-09-09T12:24:56' }] }, true],
    [
      'title and body',
      { posts: [{ title: 'title', body: 'body', uT: '2021-09-09T12:24:56' }] },
      true,
    ],
    ['error time', { posts: [{ body: 'testing', uT: '2021-13-09T12:24:56' }] }, false],
    [
      'error img',
      {
        posts: [
          { body: 'testing', img: 'http://announcing.test/test.jpg', uT: '2021-12-09T12:24:56' },
        ],
      },
      false,
    ],
  ];

  test.each(tests)('%p %p %p', (_, data, expected) => {
    try {
      expect(validatePostsImportJSON(data)).toEqual(expected);
    } catch (err) {
      console.log({ errors: validatePostsImportJSON.errors });
      throw err;
    }
  });
});
