import { JSONSchemaType } from 'ajv';
import { RequireAtLeastOne } from 'type-fest';
import {
  AnnounceMetaBase,
  ANNOUNCE_META_DESC_MAX_LENGTH,
  ANNOUNCE_META_LINK_MAX_LENGTH,
  ANNOUNCE_META_NAME_MAX_LENGTH,
  EXTERNAL_ANNOUNCES_ID_SUFFIX_MAX_LENGTH,
  EXTERNAL_ANNOUNCES_ID_SUFFIX_MIN_LENGTH,
  EXTERNAL_ANNOUNCES_JSON_KEY_MAX_LENGTH,
  EXTERNAL_ANNOUNCES_JSON_KEY_MIN_LENGTH,
  IMAGE_ID_MAX_LENGTH,
  POST_BODY_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
} from '../../shared';

type PostItem = RequireAtLeastOne<
  {
    title?: string;
    body?: string;
    pT: string;
    img?: string;
    imgs?: string[];
    link?: string;
    cID?: string; // Custom ID
    parentID?: string;
  },
  'title' | 'body'
>;

export interface ExternalAnnounceJSON {
  id: string;
  key: string;
  info: AnnounceMetaBase;
  posts: PostItem[];
}

export const ExternalAnnounceJSONSchema: JSONSchemaType<ExternalAnnounceJSON> = {
  type: 'object',
  required: ['id', 'key', 'info', 'posts'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
      minLength: EXTERNAL_ANNOUNCES_ID_SUFFIX_MIN_LENGTH,
      maxLength: EXTERNAL_ANNOUNCES_ID_SUFFIX_MAX_LENGTH,
    },
    key: {
      type: 'string',
      minLength: EXTERNAL_ANNOUNCES_JSON_KEY_MIN_LENGTH,
      maxLength: EXTERNAL_ANNOUNCES_JSON_KEY_MAX_LENGTH,
    },
    info: {
      type: 'object',
      required: ['name'],
      additionalProperties: false,
      properties: {
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
          format: 'uri',
          pattern: '^https?://',
        },
      },
    },
    posts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['pT'],
        anyOf: [{ required: ['title'] }, { required: ['body'] }],
        additionalProperties: false,
        properties: {
          title: {
            type: 'string',
            not: { type: 'null' },
            nullable: true,
            minLength: 1,
            maxLength: POST_TITLE_MAX_LENGTH,
          },
          body: {
            type: 'string',
            not: { type: 'null' },
            nullable: true,
            minLength: 1,
            maxLength: POST_BODY_MAX_LENGTH,
          },
          pT: {
            type: 'string',
            format: 'date-time',
            maxLength: 30,
          },
          img: {
            type: 'string',
            nullable: true,
            minLength: 1,
            maxLength: 1000,
            format: 'uri',
            pattern: '^https://',
          },
          imgs: {
            type: 'array',
            nullable: true,
            maxItems: 4,
            uniqueItems: true,
            items: {
              type: 'string',
              nullable: false,
              minLength: 1,
              maxLength: 1000,
              format: 'uri',
              pattern: '^https://',
            },
          },
          link: {
            type: 'string',
            nullable: true,
            minLength: 1,
            maxLength: 1000,
            format: 'uri',
            pattern: '^https://',
          },
          cID: {
            type: 'string',
            nullable: true,
            minLength: 1,
            maxLength: 100,
          },
          parentID: {
            type: 'string',
            nullable: true,
            minLength: 1,
            maxLength: 100,
          },
        },
      },
    },
  },
};
