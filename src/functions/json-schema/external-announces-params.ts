import { JSONSchemaType } from 'ajv';
import {
  DeleteExternalAnnouncesParams,
  EXTERNAL_ANNOUNCES_ID_LENGTH,
  EXTERNAL_ANNOUNCES_URL_PREFIX_MAX_LENGTH,
  NACL_KEY_MAX_LENGTH,
  PutExternalAnnouncesParams,
} from '../../shared';

export const PutExternalAnnouncesParamsSchema: JSONSchemaType<PutExternalAnnouncesParams> = {
  type: 'object',
  additionalProperties: false,
  required: ['urlPrefixes', 'pubKeys'],
  properties: {
    method: {
      type: 'string',
      const: 'PutExternalAnnounces',
    },
    urlPrefixes: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
        maxLength: EXTERNAL_ANNOUNCES_URL_PREFIX_MAX_LENGTH,
        format: 'uri',
        pattern: '^https://',
      },
    },
    pubKeys: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
        maxLength: NACL_KEY_MAX_LENGTH,
      },
    },
    desc: {
      type: 'string',
      nullable: true,
      minLength: 1,
      maxLength: EXTERNAL_ANNOUNCES_URL_PREFIX_MAX_LENGTH,
    },
    id: {
      type: 'string',
      nullable: true,
      minLength: EXTERNAL_ANNOUNCES_ID_LENGTH,
      maxLength: EXTERNAL_ANNOUNCES_ID_LENGTH,
    },
  },
};

export const DeleteExternalAnnouncesParamsSchema: JSONSchemaType<DeleteExternalAnnouncesParams> = {
  type: 'object',
  additionalProperties: false,
  required: ['id'],
  properties: {
    method: {
      type: 'string',
      const: 'DeleteExternalAnnounces',
    },
    id: {
      type: 'string',
      minLength: 1,
      maxLength: EXTERNAL_ANNOUNCES_ID_LENGTH,
    },
  },
};
