import validate from "./validate";
const gbfsSchema = require("../../schema/vehicle_types.json");

export default (object: any) => {
  return validate(gbfsSchema, object);
};
