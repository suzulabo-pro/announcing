import {
  ANNOUNCE_ID_LENGTH,
  EditImportPostsParams,
  IMPORT_POSTS_PUBKEY_MAX_LENGTH,
  IMPORT_POSTS_URL_MAX_LENGTH,
} from '@announcing/shared';
import { JSONSchemaType } from 'ajv';

export const EditImportPostsParamsSchema: JSONSchemaType<EditImportPostsParams> = {
  type: 'object',
  additionalProperties: false,
  required: ['id'],
  properties: {
    method: {
      type: 'string',
      pattern: 'EditImportPosts',
    },
    id: {
      type: 'string',
      minLength: ANNOUNCE_ID_LENGTH,
      maxLength: ANNOUNCE_ID_LENGTH,
    },
    url: {
      type: 'string',
      nullable: true,
      minLength: 1,
      maxLength: IMPORT_POSTS_URL_MAX_LENGTH,
      format: 'uri',
      pattern: '^https://',
    },
    pubKey: {
      type: 'string',
      nullable: true,
      minLength: 1,
      maxLength: IMPORT_POSTS_PUBKEY_MAX_LENGTH,
    },
  },
};
