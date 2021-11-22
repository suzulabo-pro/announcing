import {
  ANNOUNCE_META_ID_LENGTH,
  EXTERNAL_ANNOUNCES_ID_LENGTH,
  EXTERNAL_ANNOUNCES_ID_SUFFIX_MAX_LENGTH,
  EXTERNAL_ANNOUNCES_ID_SUFFIX_MIN_LENGTH,
  IMAGE_ID_MAX_LENGTH,
  IMAGE_ID_MIN_LENGTH,
  Match,
  pathMatcher,
  POST_ID_LENGTH,
} from '../../shared';
import { FirebaseAdminApp, HttpRequest, HttpResponse } from '../firebase';
import { logger } from '../utils/logger';
import { pingExternalAnnounce } from './external-announces';
import { getAnnounceMetaData, getAnnouncePostData, getImageData } from './get-data';

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
            pattern: new RegExp(`^([0-9A-Z]{12}|[0-9A-Z]{5}-[0-9a-zA-Z]{1,5})$`),
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
    pattern: 'external-announces',
    nexts: [
      {
        pattern: new RegExp(`^[A-Z0-9]{${EXTERNAL_ANNOUNCES_ID_LENGTH}}$`),
        name: 'id',
        nexts: [
          {
            pattern: new RegExp(
              `[a-zA-Z0-9]{${EXTERNAL_ANNOUNCES_ID_SUFFIX_MIN_LENGTH},${EXTERNAL_ANNOUNCES_ID_SUFFIX_MAX_LENGTH}}`,
            ),
            name: 'idSuffix',
            func: pingExternalAnnounce,
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
