import validate from "./validate";
const gbfsSchema = require("../../schema/station_status.json");

export default (object: any) => {
  return validate(gbfsSchema, object);
}
