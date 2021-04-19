import validate from "./validate";
const gbfsSchema = require("../../schema/gbfs_versions.json");

export default (object: any) => {
  return validate(gbfsSchema, object);
};
