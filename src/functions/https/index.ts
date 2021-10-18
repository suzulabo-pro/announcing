import {
  ANNOUNCE_ID_LENGTH,
  ANNOUNCE_META_ID_LENGTH,
  IMAGE_ID_MAX_LENGTH,
  IMAGE_ID_MIN_LENGTH,
  Match,
  NACL_KEY_MAX_LENGTH,
  NACL_KEY_MIN_LENGTH,
  pathMatcher,
  POST_ID_LENGTH,
} from '../../shared';
import { FirebaseAdminApp, HttpRequest, HttpResponse } from '../firebase';
import { logger } from '../utils/logger';
import { getAnnounceMetaData, getAnnouncePostData, getImageData } from './get-data';
import { pingImportPosts } from './import-posts';

type FunctionMatch = Match & {
  func?: (
    params: Record<string, string>,
    req: HttpRequest,
    res: HttpResponse,
    adminApp: FirebaseAdminApp,
  ) => Promise<void>;
};

const matches: FunctionMatch[] = [
  {
    pattern: 'data',
    nexts: [
      {
        pattern: 'announces',
        nexts: [
          {
            pattern: new RegExp(`^[A-Z0-9]{${ANNOUNCE_ID_LENGTH}}$`),
            name: 'announceID',
            nexts: [
              {
                pattern: 'meta',
                nexts: [
                  {
                    pattern: new RegExp(`^[a-zA-Z0-9]{${ANNOUNCE_META_ID_LENGTH}}$`),
                    name: 'metaID',
                    func: getAnnounceMetaData,
                  },
                ],
              },
              {
                pattern: 'posts',
                nexts: [
                  {
                    pattern: new RegExp(`^[a-zA-Z0-9]{${POST_ID_LENGTH}}$`),
                    name: 'postID',
                    func: getAnnouncePostData,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        pattern: 'images',
        nexts: [
          {
            pattern: new RegExp(`[a-zA-Z0-9]{${IMAGE_ID_MIN_LENGTH},${IMAGE_ID_MAX_LENGTH}}`),
            name: 'imageID',
            func: getImageData,
          },
        ],
      },
    ],
  },
  {
    pattern: 'import-posts',
    nexts: [
      {
        pattern: new RegExp(`^[A-Z0-9]{${ANNOUNCE_ID_LENGTH}}$`),
        name: 'announceID',
        nexts: [
          {
            pattern: new RegExp(`[a-zA-Z0-9]{${NACL_KEY_MIN_LENGTH},${NACL_KEY_MAX_LENGTH}}`),
            name: 'secKey',
            func: pingImportPosts,
          },
        ],
      },
    ],
  },
];

export const httpsRequestHandler = (
  req: HttpRequest,
  res: HttpResponse,
  adminApp: FirebaseAdminApp,
): Promise<void> => {
  const m = pathMatcher(matches, req.path);
  if (m && m.match.func) {
    logger.debug('invoke', { name: m.match.func.name, path: req.path });
    return m.match.func(m.params, req, res, adminApp);
  }

  logger.warn('invalid path', { path: req.path });
  res.sendStatus(404);
  return Promise.resolve();
};
