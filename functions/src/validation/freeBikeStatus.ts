import validate from './validate';
const gbfsSchema = require('../../schema/free_bike_status.json');

export default (object: any) => {
  return validate(gbfsSchema, object);
};
