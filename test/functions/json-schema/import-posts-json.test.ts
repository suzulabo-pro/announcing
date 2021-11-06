import { validators } from '../../../src/functions/json-schema';

describe('ImportPostsJSON', () => {
  const tests: [string, any, boolean][] = [
    ['empty', {}, false],
    ['ok', { posts: [{ body: 'testing', pT: '2021-09-09T12:24:56' }] }, true],
    [
      'additional',
      {
        posts: [{ body: 'testing', pT: '2021-09-09T12:24:56' }],
        lol: true,
      },
      false,
    ],
    ['no title body', { posts: [{ pT: '2021-09-09T12:24:56' }] }, false],
    ['null title body', { posts: [{ title: null, body: null, pT: '2021-09-09T12:24:56' }] }, false],
    ['blank title body', { posts: [{ title: '', body: '', pT: '2021-09-09T12:24:56' }] }, false],
    ['title only', { posts: [{ title: 'title only', pT: '2021-09-09T12:24:56' }] }, true],
    [
      'title and body',
      { posts: [{ title: 'title', body: 'body', pT: '2021-09-09T12:24:56' }] },
      true,
    ],
    ['error time', { posts: [{ body: 'testing', pT: '2021-13-09T12:24:56' }] }, false],
    [
      'error img',
      {
        posts: [
          { body: 'testing', img: 'http://announcing.test/test.jpg', pT: '2021-12-09T12:24:56' },
        ],
      },
      false,
    ],
  ];

  test.each(tests)('%p %p %p', (_, data, expected) => {
    expect(validators.importPostsJSON(data)).toEqual(expected);
  });
});
