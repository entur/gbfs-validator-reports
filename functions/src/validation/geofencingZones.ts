import validate from "./validate";
const gbfsSchema = require("../../schema/geofencing_zones.json");

export default (object: any) => {
  return validate(gbfsSchema, object);
};
