import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { PostRule } from '../../../../shared/dist';
import { RequireAtLeastOne } from 'type-fest';

const ajv = new Ajv();
addFormats(ajv);

type PostItem = RequireAtLeastOne<
  {
    title?: string;
    body?: string;
    uT: string;
    img?: string;
    imgs?: string[];
    cID?: string; // Custom ID
    refID?: string;
  },
  'title' | 'body'
>;

export interface PostsImportJSON {
  posts: PostItem[];
}

const PostsImportJSONSchema: JSONSchemaType<PostsImportJSON> = {
  type: 'object',
  properties: {
    posts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['uT'],
        anyOf: [{ required: ['title'] }, { required: ['body'] }],
        additionalProperties: false,
        properties: {
          title: {
            type: 'string',
            not: { type: 'null' },
            nullable: true,
            minLength: 1,
            maxLength: PostRule.title.length,
          },
          body: {
            type: 'string',
            not: { type: 'null' },
            nullable: true,
            minLength: 1,
            maxLength: PostRule.body.length,
          },
          uT: {
            type: 'string',
            format: 'date-time',
          },
          img: {
            type: 'string',
            nullable: true,
            minLength: 1,
            maxLength: 1000,
            format: 'url',
            pattern: '^(https)://',
          },
          imgs: {
            type: 'array',
            nullable: true,
            items: {
              type: 'string',
              nullable: false,
              minLength: 1,
              maxLength: 1000,
              format: 'url',
              pattern: '^(https)://',
            },
          },
          cID: {
            type: 'string',
            nullable: true,
            minLength: 1,
            maxLength: 100,
          },
          refID: {
            type: 'string',
            nullable: true,
            minLength: 1,
            maxLength: 100,
          },
        },
      },
    },
  },
  required: ['posts'],
  additionalProperties: false,
};

export const validatePostsImportJSON = ajv.compile(PostsImportJSONSchema);
