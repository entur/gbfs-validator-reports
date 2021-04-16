import validate from "./validate";
const gbfsSchema = require("../../schema/system_regions.json");

export default (object: any) => {
  return validate(gbfsSchema, object);
}
