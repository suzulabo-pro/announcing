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
    pT: string;
    img?: string;
    imgs?: string[];
    link?: string;
    cID?: string; // Custom ID
    parentID?: string;
  },
  'title' | 'body'
>;

export interface PostsImportJSON {
  posts: PostItem[];
}

const PostsImportJSONSchema: JSONSchemaType<PostsImportJSON> = {
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
            maxLength: PostRule.title.length,
          },
          body: {
            type: 'string',
            not: { type: 'null' },
            nullable: true,
            minLength: 1,
            maxLength: PostRule.body.length,
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
            format: 'url',
            pattern: '^https://',
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
              pattern: '^https://',
            },
          },
          link: {
            type: 'string',
            nullable: true,
            minLength: 1,
            maxLength: 1000,
            format: 'url',
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

export const validatePostsImportJSON = ajv.compile(PostsImportJSONSchema);

// testing
export const _PostsImportJSONSchema = PostsImportJSONSchema;
