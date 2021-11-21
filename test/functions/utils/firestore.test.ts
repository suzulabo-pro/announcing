import { announceMetaHash, toMD5Base62, _serialize } from '../../../src/functions/utils/firestore';
import { AnnounceMeta } from '../../../src/shared';

describe('firestore', () => {
  it('_serialize', () => {
    const a = _serialize('a', 'b', 'c');
    expect(a).toEqual(_serialize('a', 'b', 'c', undefined, undefined));
  });
  it('announceMetaHash', () => {
    const a = announceMetaHash({ name: 'a' } as AnnounceMeta);
    expect(a).not.toEqual(announceMetaHash({ name: 'b' } as AnnounceMeta));
    expect(a).toEqual(announceMetaHash({ name: 'a', link: '' } as AnnounceMeta));
  });

  it('toMD5Base62', () => {
    expect(toMD5Base62('2YWHY')).toEqual('5zam442RvOiyEGTiJMdbq6');
  });
});
