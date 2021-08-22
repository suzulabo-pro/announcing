import { validatePostsImportJSON } from '../../src/import-posts/datatypes';

describe('import posts validate', () => {
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
