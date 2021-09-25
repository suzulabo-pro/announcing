import {
  ANNOUNCE_ID_LENGTH,
  LANG_LENGTH,
  NOTIFICATION_TOKEN_MAX_LENGTH,
  RegisterNotificationParams,
  REGISTER_NOTIFICATION_SIGNKEY_MAX_LENGTH,
  REGISTER_NOTIFICATION_SIGN_MAX_LENGTH,
} from '@announcing/shared';
import { JSONSchemaType } from 'ajv';

export const RegisterNotificationParamsSchema: JSONSchemaType<RegisterNotificationParams> = {
  type: 'object',
  additionalProperties: false,
  required: ['token'],
  properties: {
    method: {
      type: 'string',
      pattern: 'RegisterNotification',
    },
    reqTime: {
      type: 'string',
      format: 'date-time',
    },
    token: {
      type: 'string',
      maxLength: NOTIFICATION_TOKEN_MAX_LENGTH,
    },
    signKey: {
      type: 'string',
      maxLength: REGISTER_NOTIFICATION_SIGNKEY_MAX_LENGTH,
    },
    sign: {
      type: 'string',
      maxLength: REGISTER_NOTIFICATION_SIGN_MAX_LENGTH,
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
