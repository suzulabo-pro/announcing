import { ANNOUNCE_ID_LENGTH, DeleteAnnounceParams } from '@announcing/shared';
import { JSONSchemaType } from 'ajv';

export const DeleteAnnounceParamsSchema: JSONSchemaType<DeleteAnnounceParams> = {
  type: 'object',
  additionalProperties: false,
  required: ['id'],
  properties: {
    method: {
      type: 'string',
      const: 'DeleteAnnounce',
    },
    id: {
      type: 'string',
      minLength: ANNOUNCE_ID_LENGTH,
      maxLength: ANNOUNCE_ID_LENGTH,
    },
  },
};
