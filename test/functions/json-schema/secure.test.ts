import Ajv from 'ajv';
import { __schemas } from '../../../src/functions/json-schema';

// https://ajv.js.org/security.html#security-risks-of-trusted-schemas
const ajv = new Ajv({ strictTypes: false });
const isSchemaSecure = ajv.compile(
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('ajv/lib/refs/json-schema-secure.json'),
);

describe('secure', () => {
  const tests = Object.entries(__schemas).filter(([k]) => !k.startsWith('http'));
  test.each(tests)('%p', (_, schema) => {
    isSchemaSecure(schema?.schema);
    expect(isSchemaSecure.errors).toBeNull();
  });
});
