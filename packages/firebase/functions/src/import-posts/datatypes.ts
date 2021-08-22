import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { PostRule } from '../../../../shared/dist';
const ajv = new Ajv();
addFormats(ajv);

export interface PostsImportJSON {
  posts: {
    title?: string;
    body?: string;
    uT: string;
    img?: string;
    imgs?: string[];
    cID?: string; // Custom ID
    refID?: string;
  }[];
}

const PostsImportJSONSchema: JSONSchemaType<PostsImportJSON> = {
  type: 'object',
  properties: {
    posts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', nullable: true, maxLength: PostRule.title.length },
          body: { type: 'string', nullable: true, maxLength: PostRule.body.length },
          uT: { type: 'string', format: 'date-time' },
          img: {
            type: 'string',
            nullable: true,
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
              maxLength: 1000,
              format: 'url',
              pattern: '^(https)://',
            },
          },
          cID: { type: 'string', nullable: true, maxLength: 100 },
          refID: { type: 'string', nullable: true, maxLength: 100 },
        },
        required: ['uT'],
        anyOf: [{ required: ['title'] }, { required: ['body'] }],
        additionalProperties: false,
      },
    },
  },
  required: ['posts'],
  additionalProperties: false,
};

export const validatePostsImportJSON = ajv.compile(PostsImportJSONSchema);
