import validate from './validate';
const gbfsSchema = require('../../schema/system_information.json');

export default (object: any) => {
  return validate(gbfsSchema, object);
};
