import { ANNOUNCE_ID_LENGTH } from '../../shared';
import { JSONSchemaType } from 'ajv';

export interface ImportPostsFetchMessage {
  id: string;
  uT: number;
}

export const ImportPostsFetchMessageSchema: JSONSchemaType<ImportPostsFetchMessage> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'uT'],
  properties: {
    id: {
      type: 'string',
      minLength: ANNOUNCE_ID_LENGTH,
      maxLength: ANNOUNCE_ID_LENGTH,
    },
    uT: {
      type: 'number',
    },
  },
};
