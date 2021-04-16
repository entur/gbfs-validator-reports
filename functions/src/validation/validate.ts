import Ajv, { Schema } from 'ajv';
import formatsPlugin from 'ajv-formats';

const validate = <T>(schema: Schema, object: T) => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  formatsPlugin(ajv);
  const validate = ajv.compile<T>(schema);
  const valid = validate(object);
  return valid ? false : validate.errors;
}

export default validate;

