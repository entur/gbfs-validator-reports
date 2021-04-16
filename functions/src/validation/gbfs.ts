import validate from "./validate";
const gbfsSchema = require("../../schema/gbfs.json");

export default (object: any) => {
  return validate(gbfsSchema, object);
}
