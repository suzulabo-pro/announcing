import {
  ANNOUNCE_ID_LENGTH,
  IMAGE_DATA_MAX_LENGTH,
  POST_BODY_MAX_LENGTH,
  POST_ID_LENGTH,
  POST_LINK_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  PutPostParams,
} from '../../shared';
import { JSONSchemaType } from 'ajv';

export const PutPostParamsSchema: JSONSchemaType<PutPostParams> = {
  type: 'object',
  additionalProperties: false,
  required: ['id'],
  anyOf: [{ required: ['title'] }, { required: ['body'] }],
  properties: {
    method: {
      type: 'string',
      const: 'PutPost',
    },
    id: {
      type: 'string',
      minLength: ANNOUNCE_ID_LENGTH,
      maxLength: ANNOUNCE_ID_LENGTH,
    },
    title: {
      type: 'string',
      nullable: true,
      minLength: 1,
      maxLength: POST_TITLE_MAX_LENGTH,
    },
    body: {
      type: 'string',
      nullable: true,
      minLength: 1,
      maxLength: POST_BODY_MAX_LENGTH,
    },
    link: {
      type: 'string',
      nullable: true,
      minLength: 1,
      maxLength: POST_LINK_MAX_LENGTH,
      format: 'uri',
      pattern: '^https?://',
    },
    imgData: {
      type: 'string',
      nullable: true,
      minLength: 1,
      maxLength: IMAGE_DATA_MAX_LENGTH,
    },
    editID: {
      type: 'string',
      nullable: true,
      minLength: POST_ID_LENGTH,
      maxLength: POST_ID_LENGTH,
    },
  },
};
