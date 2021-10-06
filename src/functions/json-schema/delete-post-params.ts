import { ANNOUNCE_ID_LENGTH, DeletePostParams, POST_ID_LENGTH } from '../../shared';
import { JSONSchemaType } from 'ajv';

export const DeletePostParamsSchema: JSONSchemaType<DeletePostParams> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'postID'],
  properties: {
    method: {
      type: 'string',
      const: 'DeletePost',
    },
    id: {
      type: 'string',
      minLength: ANNOUNCE_ID_LENGTH,
      maxLength: ANNOUNCE_ID_LENGTH,
    },
    postID: {
      type: 'string',
      minLength: POST_ID_LENGTH,
      maxLength: POST_ID_LENGTH,
    },
  },
};
