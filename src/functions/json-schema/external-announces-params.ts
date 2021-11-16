import { JSONSchemaType } from 'ajv';
import {
  EXTERNAL_ANNOUNCES_URL_PREFIX_MAX_LENGTH,
  NACL_KEY_MAX_LENGTH,
  RegisterExternalAnnouncesParams,
} from '../../shared';

export const RegisterExternalAnnouncesParamsSchema: JSONSchemaType<RegisterExternalAnnouncesParams> =
  {
    type: 'object',
    additionalProperties: false,
    required: ['urlPrefix', 'pubKey'],
    properties: {
      method: {
        type: 'string',
        const: 'RegisterExternalAnnounces',
      },
      urlPrefix: {
        type: 'string',
        minLength: 1,
        maxLength: EXTERNAL_ANNOUNCES_URL_PREFIX_MAX_LENGTH,
        format: 'uri',
        pattern: '^https://',
      },
      pubKey: {
        type: 'string',
        minLength: 1,
        maxLength: NACL_KEY_MAX_LENGTH,
      },
    },
  };
