import {
  ANNOUNCE_ID_LENGTH,
  LANG_LENGTH,
  NACL_KEY_MAX_LENGTH,
  NACL_SIGN_MAX_LENGTH,
  NOTIFICATION_TOKEN_MAX_LENGTH,
  RegisterNotificationParams,
} from '../../shared';
import { JSONSchemaType } from 'ajv';

export const RegisterNotificationParamsSchema: JSONSchemaType<RegisterNotificationParams> = {
  type: 'object',
  additionalProperties: false,
  required: ['token'],
  properties: {
    method: {
      type: 'string',
      const: 'RegisterNotification',
    },
    reqTime: {
      type: 'string',
      format: 'date-time',
      maxLength: 40,
    },
    token: {
      type: 'string',
      maxLength: NOTIFICATION_TOKEN_MAX_LENGTH,
    },
    signKey: {
      type: 'string',
      maxLength: NACL_KEY_MAX_LENGTH,
    },
    sign: {
      type: 'string',
      maxLength: NACL_SIGN_MAX_LENGTH,
    },
    lang: {
      type: 'string',
      minLength: LANG_LENGTH,
      maxLength: LANG_LENGTH,
    },
    announces: {
      type: 'array',
      items: {
        type: 'string',
        maxLength: ANNOUNCE_ID_LENGTH,
      },
    },
  },
};
