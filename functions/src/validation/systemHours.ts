import validate from "./validate";
const gbfsSchema = require("../../schema/system_hours.json");

export default (object: any) => {
  return validate(gbfsSchema, object);
};
