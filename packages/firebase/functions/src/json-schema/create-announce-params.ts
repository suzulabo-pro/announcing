import {
  ANNOUNCE_META_DESC_MAX_LENGTH,
  ANNOUNCE_META_NAME_MAX_LENGTH,
  CreateAnnounceParams,
} from '@announcing/shared';
import { JSONSchemaType } from 'ajv';

export const CreateAnnounceParamsSchema: JSONSchemaType<CreateAnnounceParams> = {
  type: 'object',
  additionalProperties: false,
  required: ['name'],
  properties: {
    method: {
      type: 'string',
      pattern: 'CreateAnnounce',
    },
    name: {
      type: 'string',
      maxLength: ANNOUNCE_META_NAME_MAX_LENGTH,
    },
    desc: {
      type: 'string',
      nullable: true,
      minLength: 1,
      maxLength: ANNOUNCE_META_DESC_MAX_LENGTH,
    },
  },
};
