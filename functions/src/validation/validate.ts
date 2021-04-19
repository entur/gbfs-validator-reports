import Ajv, { ErrorObject, Schema } from 'ajv';
import formatsPlugin from 'ajv-formats';

const validate = <T>(
  schema: Schema,
  object: T,
): boolean | ErrorObject<string, Record<string, any>>[] => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  formatsPlugin(ajv);
  const validate = ajv.compile<T>(schema);
  const valid = validate(object);

  if (valid) {
    return false;
  }

  return validate.errors || true;
};

export default validate;
