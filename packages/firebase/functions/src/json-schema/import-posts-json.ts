import { POST_BODY_MAX_LENGTH, POST_TITLE_MAX_LENGTH } from '@announcing/shared';
import { JSONSchemaType } from 'ajv';
import { RequireAtLeastOne } from 'type-fest';

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

export interface ImportPostsJSON {
  posts: PostItem[];
}

export const ImportPostsJSONSchema: JSONSchemaType<ImportPostsJSON> = {
  type: 'object',
  required: ['posts'],
  additionalProperties: false,
  properties: {
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
