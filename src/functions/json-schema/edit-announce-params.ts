import {
  ANNOUNCE_ID_LENGTH,
  ANNOUNCE_META_DESC_MAX_LENGTH,
  ANNOUNCE_META_LINK_MAX_LENGTH,
  ANNOUNCE_META_NAME_MAX_LENGTH,
  EditAnnounceParams,
  IMAGE_DATA_MAX_LENGTH,
  IMAGE_ID_MAX_LENGTH,
} from '../../shared';
import { JSONSchemaType } from 'ajv';

export const EditAnnounceParamsSchema: JSONSchemaType<EditAnnounceParams> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'name'],
  properties: {
    method: {
      type: 'string',
      const: 'EditAnnounce',
    },
    id: {
      type: 'string',
      minLength: ANNOUNCE_ID_LENGTH,
      maxLength: ANNOUNCE_ID_LENGTH,
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
    link: {
      type: 'string',
      nullable: true,
      minLength: 1,
      maxLength: ANNOUNCE_META_LINK_MAX_LENGTH,
      format: 'uri',
      pattern: '^https?://',
    },
    icon: {
      type: 'string',
      nullable: true,
      minLength: 1,
      maxLength: IMAGE_ID_MAX_LENGTH,
    },
    newIcon: {
      type: 'string',
      nullable: true,
      minLength: 1,
      maxLength: IMAGE_DATA_MAX_LENGTH,
    },
  },
};
